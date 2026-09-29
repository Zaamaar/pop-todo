(function(){
  var KEY='pop.v1';
  var list=document.getElementById('list'), input=document.getElementById('input'),
      form=document.getElementById('form'), empty=document.getElementById('empty'),
      leftEl=document.getElementById('left'), doneEl=document.getElementById('done');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var todos=[
    {id:1,text:'Build the todo app with AI'},
    {id:2,text:'Deploy it live on Netlify'},
    {id:3,text:'Write agents.md to structure the work'},
    {id:4,text:'Push the code to a private GitHub repo'}
  ], nextId=5, popped=0;

  function load(){
    try{
      var d=JSON.parse(localStorage.getItem(KEY));
      if(d && Array.isArray(d.todos)){ todos=d.todos; nextId=d.nextId||todos.length+1; popped=d.popped||0; }
    }catch(e){}
  }
  function save(){
    try{ localStorage.setItem(KEY,JSON.stringify({todos:todos,nextId:nextId,popped:popped})); }catch(e){}
  }

  function render(){
    list.innerHTML='';
    todos.forEach(function(t){
      var li=document.createElement('li'); li.className='todo'; li.dataset.id=t.id;
      li.innerHTML='<div class="fill"></div><button class="bal" aria-label="Mark complete"></button><span class="txt"></span><button class="del" aria-label="Delete task">&times;</button>';
      li.querySelector('.txt').textContent=t.text;
      list.appendChild(li);
    });
    empty.hidden=todos.length>0;
    leftEl.textContent=todos.length; doneEl.textContent=popped;
    save();
  }

  form.addEventListener('submit',function(e){
    e.preventDefault();
    var v=input.value.trim(); if(!v) return;
    todos.push({id:nextId++,text:v}); input.value=''; render();
  });

  list.addEventListener('click',function(e){
    var li=e.target.closest('.todo'); if(!li) return;
    var id=+li.dataset.id;
    if(e.target.closest('.del')){ todos=todos.filter(function(t){return t.id!==id}); render(); return; }
    if(e.target.closest('.bal') && !li.classList.contains('inflating')) complete(li,id);
  });

  function complete(li,id){
    li.classList.add('inflating');
    setTimeout(function(){
      burst(li.getBoundingClientRect());
      li.style.height=li.offsetHeight+'px';
      Array.prototype.forEach.call(li.children,function(c){c.style.visibility='hidden'});
      li.style.background='transparent'; li.style.borderColor='transparent';
      li.classList.remove('inflating'); li.style.animation='none';
      void li.offsetHeight;
      li.style.height='0px'; li.classList.add('gone');
      setTimeout(function(){
        todos=todos.filter(function(t){return t.id!==id}); popped++; render();
      },380);
    }, reduce?20:760);
  }

  /* ---- burst effect ---- */
  var cv=document.getElementById('fx'), ctx=cv.getContext('2d'), parts=[], rings=[], running=false;
  function size(){var d=window.devicePixelRatio||1; cv.width=innerWidth*d; cv.height=innerHeight*d; ctx.setTransform(d,0,0,d,0,0)}
  size(); addEventListener('resize',size);
  function css(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()}
  function rnd(a,b){return a+Math.random()*(b-a)}

  function burst(r){
    if(reduce) return;
    var small=innerWidth<500, k=small?.65:1;
    var cx=r.left+r.width/2, cy=r.top+r.height/2;
    var water=css('--water'), soft=css('--water-soft'), pop=css('--pop');
    rings.push({x:cx,y:cy,r:10,max:Math.max(r.width,160)*.6,a:.9});
    var i,a,s;
    for(i=0;i<Math.round(46*k);i++){
      a=rnd(0,Math.PI*2); s=rnd(3,11)*k;
      parts.push({k:'drop',x:r.left+rnd(0,r.width),y:r.top+rnd(0,r.height),
        vx:Math.cos(a)*s,vy:Math.sin(a)*s-3,g:.45,sz:rnd(2.5,7)*k,c:Math.random()<.5?water:soft,life:1,d:rnd(.012,.022)});
    }
    for(i=0;i<Math.round(14*k);i++){
      a=rnd(0,Math.PI*2); s=rnd(4,10)*k;
      parts.push({k:'shard',x:cx+rnd(-r.width/3,r.width/3),y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s-4,g:.5,
        sz:rnd(6,13)*k,rot:rnd(0,6),vr:rnd(-.35,.35),c:Math.random()<.6?pop:water,life:1,d:rnd(.01,.016)});
    }
    for(i=0;i<Math.round(12*k);i++){
      parts.push({k:'air',x:r.left+rnd(0,r.width),y:r.top+rnd(0,r.height),vx:rnd(-1,1),vy:rnd(-3.5,-1.2),g:-.02,
        sz:rnd(3,8)*k,life:1,d:rnd(.01,.018)});
    }
    if(!running){running=true; requestAnimationFrame(tick)}
  }

  function tick(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    rings=rings.filter(function(o){
      o.r+=(o.max-o.r)*.16+1.5; o.a-=.045;
      if(o.a<=0) return false;
      ctx.globalAlpha=o.a; ctx.strokeStyle=css('--water'); ctx.lineWidth=4;
      ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.stroke(); return true;
    });
    parts=parts.filter(function(p){
      p.vy+=p.g; p.x+=p.vx; p.y+=p.vy; p.vx*=.99; p.life-=p.d;
      if(p.life<=0) return false;
      ctx.globalAlpha=Math.max(p.life,0);
      if(p.k==='drop'){
        ctx.fillStyle=p.c; ctx.beginPath(); ctx.ellipse(p.x,p.y,p.sz*.8,p.sz*(1+Math.abs(p.vy)*.06),0,0,Math.PI*2); ctx.fill();
      } else if(p.k==='shard'){
        p.rot+=p.vr; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.c;
        ctx.beginPath(); ctx.moveTo(0,-p.sz); ctx.lineTo(p.sz*.8,p.sz*.6); ctx.lineTo(-p.sz*.5,p.sz*.4); ctx.closePath(); ctx.fill(); ctx.restore();
      } else {
        ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(p.x,p.y,p.sz,0,Math.PI*2); ctx.stroke();
      }
      return true;
    });
    ctx.globalAlpha=1;
    if(parts.length||rings.length) requestAnimationFrame(tick); else {running=false; ctx.clearRect(0,0,innerWidth,innerHeight)}
  }

  load(); render();
})();
