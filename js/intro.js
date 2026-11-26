/* GANGNAM OBJECT — 사이트 진입 연출
   1) 축제 일정 6개가 리스트로 떠오르고
   2) 각 일정의 아이콘이 날아가 하나의 원으로 모이고
   3) 그 원이 그려지며 은빛 링·보라 다이얼로 바뀐 뒤, 축제 첫 순간(10.03 16:00)에 맞춰짐
   3D 오브제를 다 불러오면 다이얼이 화면 가득 열리며 사이트로 들어갑니다. */
(function(){
  var intro=document.getElementById('intro');
  if(!intro)return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.documentElement;
  root.classList.add('intro-lock');
  try{history.scrollRestoration='manual'}catch(e){}
  window.scrollTo(0,0);

  var NS='http://www.w3.org/2000/svg';
  var dialBox=intro.querySelector('.intro-dial');
  var ring=document.getElementById('introRing'),ticks=document.getElementById('introTicks');
  var inner=document.getElementById('introInner'),list=document.getElementById('introList');

  // 사이트의 축제 일정과 같은 순서 (은빛 링 위 시계방향 0°,60°,…)
  var PROG=[
    {id:'i-flag', name:'그랜드 퍼레이드',     day:'10.03 금',t:'16:00'},
    {id:'i-music',name:'패밀리 콘서트',       day:'10.03 금',t:'19:00'},
    {id:'i-sound',name:'EDM 파티',            day:'10.03 금',t:'21:30'},
    {id:'i-shirt',name:'패션 · 뷰티 페스타',  day:'10.04 토',t:'13:00'},
    {id:'i-food', name:'글로벌 푸드 경연대회',day:'10.04 토',t:'14:00'},
    {id:'i-spark',name:'K-POP 콘서트',        day:'10.04 토',t:'18:00'}
  ];
  var R=146,IC=28; // 링 위 아이콘 반지름·크기 (SVG 400 기준)

  // ── 다이얼 만들기 ──
  for(var i=0;i<60;i++){
    var l=document.createElementNS(NS,'line'),a=i*6*Math.PI/180,r1=188,r2=i%5?180:172;
    l.setAttribute('x1',200+Math.sin(a)*r1);l.setAttribute('y1',200-Math.cos(a)*r1);
    l.setAttribute('x2',200+Math.sin(a)*r2);l.setAttribute('y2',200-Math.cos(a)*r2);
    if(!(i%5))l.setAttribute('class','major');
    l.style.transitionDelay=(i*12)+'ms';
    ticks.appendChild(l);
  }
  var svgIcons=PROG.map(function(p,k){
    var rad=k*60*Math.PI/180,g=document.createElementNS(NS,'g');
    g.setAttribute('class','intro-ic on');
    g.setAttribute('transform','translate('+(200+Math.sin(rad)*R)+' '+(200-Math.cos(rad)*R)+')');
    var u=document.createElementNS(NS,'use');
    u.setAttribute('href','#'+p.id);u.setAttribute('x',-IC/2);u.setAttribute('y',-IC/2);u.setAttribute('width',IC);u.setAttribute('height',IC);
    g.appendChild(u);ring.appendChild(g);return g;
  });
  for(var h=0;h<24;h++){
    var t=document.createElementNS(NS,'line'),b=h*15*Math.PI/180,q=h%6?94:88;
    t.setAttribute('x1',200+Math.sin(b)*100);t.setAttribute('y1',200-Math.cos(b)*100);
    t.setAttribute('x2',200+Math.sin(b)*q);t.setAttribute('y2',200-Math.cos(b)*q);
    inner.appendChild(t);
    if(!(h%3)){
      var tx=document.createElementNS(NS,'text'),x=200+Math.sin(b)*78,y=200-Math.cos(b)*78;
      tx.textContent=h;tx.setAttribute('class','intro-hr');tx.setAttribute('x',x);tx.setAttribute('y',y);
      tx.setAttribute('transform','rotate('+(h*15)+' '+x+' '+y+')');
      inner.appendChild(tx);
    }
  }

  // ── 일정 리스트 ──
  var rows=PROG.map(function(p,k){
    var li=document.createElement('li');
    li.style.setProperty('--d',(k*110)+'ms');
    li.innerHTML='<i class="il-ic"><svg><use href="#'+p.id+'"/></svg></i><b>'+p.name+'</b><span>'+p.day+' '+p.t+'</span>';
    list.appendChild(li);return li;
  });

  // ── 진행 ──
  var done=false,ready=false,formed=false,loaded=false,queued=false,t0=performance.now();
  var MAX=12000;
  var story=document.getElementById('story-model');
  function markLoaded(){loaded=true;maybeReady()}
  if(story){
    story.addEventListener('load',markLoaded,{once:true});
    story.addEventListener('error',markLoaded,{once:true});
  }else loaded=true;
  setTimeout(markLoaded,MAX);

  var T=reduce?{list:0,gather:0,trace:0,dial:0,set:0}:{list:200,gather:2300,trace:3400,dial:4100,set:4900};
  function at(ms,fn){setTimeout(function(){if(!done)fn()},ms)}

  // 1) 리스트 등장
  at(T.list,function(){intro.classList.add('p-list')});

  // 2) 아이콘이 원 위 자리로 날아감 (FLIP)
  at(T.gather,function(){
    var box=dialBox.getBoundingClientRect(),s=box.width/400;
    rows.forEach(function(li,k){
      var ic=li.querySelector('.il-ic'),r=ic.getBoundingClientRect();
      var rad=k*60*Math.PI/180;
      var tx=box.left+(200+Math.sin(rad)*R)*s,ty=box.top+(200-Math.cos(rad)*R)*s;
      var cx=r.left+r.width/2,cy=r.top+r.height/2,sc=(IC*s)/r.width;
      ic.style.transitionDelay=(k*70)+'ms';
      ic.style.transform='translate('+(tx-cx)+'px,'+(ty-cy)+'px) scale('+sc+')';
    });
    intro.classList.add('p-gather');
  });

  // 3) 아이콘을 잇는 원이 그려짐
  at(T.trace,function(){intro.classList.add('p-trace')});

  // 4) 원이 다이얼로: 리스트 아이콘 → 링 아이콘으로 교체, 링·눈금·보라 다이얼 등장
  at(T.dial,function(){intro.classList.add('p-dial')});

  // 5) 축제 첫 순간(16:00)에 맞춰지며 딸깍 — 퍼레이드만 켜진 상태
  at(T.set,function(){
    intro.classList.add('p-set');
    svgIcons.forEach(function(g,k){if(k)g.classList.remove('on')});
    if(!reduce){intro.classList.remove('tick');void intro.offsetWidth;intro.classList.add('tick')}
    formed=true;maybeReady();
  });

  function maybeReady(){
    if(ready||!formed||!loaded||done)return;
    ready=true;intro.classList.add('ready');
    setTimeout(enter,queued?350:(reduce?200:1800)); // 손대지 않아도 자동 입장
  }

  function enter(){
    if(done)return;done=true;
    intro.classList.add('open');
    root.classList.remove('intro-lock');
    window.scrollTo(0,0);
    setTimeout(function(){intro.remove();document.dispatchEvent(new Event('intro:done'))},reduce?400:1900);
  }
  // 준비된 뒤엔 클릭·스크롤·키로 바로 입장 (그 전에 누르면 준비되는 대로 입장)
  function userEnter(){if(ready)enter();else queued=true}
  intro.addEventListener('click',userEnter);
  intro.addEventListener('wheel',userEnter,{passive:true});
  intro.addEventListener('touchmove',userEnter,{passive:true});
  window.addEventListener('keydown',function(e){if(!done&&(ready||e.key==='Escape'))enter()});
  document.getElementById('introSkip').addEventListener('click',function(e){e.stopPropagation();enter()});
})();
