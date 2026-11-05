'use strict';
/* Harvest Hollow - engine. Made by Jaineil Rana (JaKing) */
const $=i=>document.getElementById(i),cv=$('cv'),cx=cv.getContext('2d'),uc=$('ui'),ux=uc.getContext('2d');
let SC=3,VW=320,VH=200,DPR=1,S=null,mode='title',panelOn=false,T,SOL,TREES=[],BLD=[],LAMPS=[],LIGHTS=[],ground=null,gKey='';
const P={x:96,y:124,dir:0,fr:0,ft:0,act:0};
let parts=[],floats=[],drops=[],flash=0,shake=0,npcs=[],fish=null,keys={},joy={x:0,y:0},hold=false,camX=0,camY=0,tickT=0,now=0,thT=6,promptT=0,curT=null;
const isTouch=matchMedia('(pointer:coarse)').matches||'ontouchstart' in window,TICK=4.2,PL={sk:'#f2c494',h:'#6a3a1a',sh:'#4a8ad0',pa:'#4a5a8a',hat:'#e8c050'},SAVE='harvesthollow.v1';
const idx=(x,y)=>y*MW+x,cl=(v,a,b)=>v<a?a:v>b?b:v,fmt=n=>Math.floor(n).toLocaleString('en-US'),DIRV=[[0,1],[0,-1],[-1,0],[1,0]];
const WXI={sun:'☀️',cloud:'⛅',rain:'🌧️',storm:'⛈️',snow:'❄️'},WXN={sun:'Sunny',cloud:'Cloudy',rain:'Rain',storm:'Thunderstorm',snow:'Snow'};
/* ---------- map ---------- */
function buildMap(){T=new Uint8Array(MW*MH);SOL=new Uint8Array(MW*MH);TREES=[];
 const set=(x,y,v)=>{if(x>=0&&y>=0&&x<MW&&y<MH)T[idx(x,y)]=v},rc=(a,b,c,d,v)=>{for(let y=b;y<=d;y++)for(let x=a;x<=c;x++)set(x,y,v)};
 rc(5,7,6,8,1);rc(3,8,21,9,1);rc(20,8,21,25,1);rc(20,24,63,25,1);rc(28,15,29,24,1);rc(38,8,61,9,1);rc(42,10,43,12,1);rc(49,10,50,12,1);rc(56,10,57,12,1);
 rc(42,19,59,29,4);rc(38,26,41,34,1);
 for(let y=22;y<38;y++)for(let x=1;x<20;x++){const d=(x-9)**2/30+(y-31)**2/13;if(d<1)set(x,y,2);else if(d<1.5&&!T[idx(x,y)])set(x,y,3)}
 rc(26,38,63,41,2);rc(26,37,63,37,3);rc(44,36,54,36,3);
 for(let y=2;y<=15;y++){set(22,y,5);set(36,y,5)}for(let x=22;x<=36;x++)if(x<28||x>29)set(x,15,5);
 BLD=[{k:'house',x:3,y:2,w:6,h:5},{k:'bin',x:10,y:6,w:1,h:1},{k:'coop',x:24,y:2,w:4,h:4},{k:'barn',x:30,y:2,w:5,h:5},
  {k:'home',x:39,y:3,w:4,h:5,c:'#c85a5a',who:"June & Pip's house"},{k:'home',x:45,y:3,w:4,h:5,c:'#5a7ac8',who:"Mayor Bram's house"},{k:'home',x:51,y:3,w:4,h:5,c:'#8a6a4a',who:"Rowan's house"},{k:'home',x:57,y:3,w:4,h:5,c:'#3a9a9a',who:"Nell's cottage"},
  {k:'shop',x:39,y:13,w:6,h:5},{k:'forge',x:47,y:13,w:5,h:5},{k:'hall',x:54,y:13,w:6,h:5},{k:'sage',x:35,y:29,w:5,h:4},{k:'board',x:45,y:20,w:1,h:1},{k:'fount',x:50,y:23,w:3,h:3}];
 LAMPS=[[9,7],[44,19],[53,19],[42,29],[58,29],[22,23]];
 for(const b of BLD)for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)SOL[idx(x,y)]=1;
 const tree=(x,y)=>{if(x<0||y<0||x>=MW||y>=MH||SOL[idx(x,y)]||T[idx(x,y)]==2||T[idx(x,y)]==1)return;TREES.push([x,y]);SOL[idx(x,y)]=1};
 for(let x=0;x<MW;x++){tree(x,x%2);tree(x,MH-1-x%2)}for(let y=2;y<MH-2;y++){tree(y%2,y);tree(MW-1-y%2,y)}
 const r=rngF(42),res=(x,y)=>(x<13&&y<11)||(x>2&&x<21&&y>8&&y<23)||(x>20&&x<38&&y<19)||(x>36&&y>2&&y<36)||(x<21&&y>21&&y<38)||y>35||T[idx(x,y)];
 for(let k=0;k<220;k++){const x=2+r()*60|0,y=2+r()*40|0;if(!res(x,y)&&!TREES.some(t=>Math.abs(t[0]-x)+Math.abs(t[1]-y)<2))tree(x,y)}
 [[38,11],[46,10],[53,11],[60,12],[37,20],[61,21],[61,31],[44,33],[56,33]].forEach(p=>tree(p[0],p[1]));
 for(let i=0;i<MW*MH;i++)if(T[i]==2||T[i]==5)SOL[i]=1}
const bldAt=(x,y)=>BLD.find(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h);
const inField=(x,y)=>{const f=FIELDS[S.field];return x>=f[0]&&y>=f[1]&&x<=f[2]&&y<=f[3]};
const solid=(px,py)=>{const x=px>>4,y=py>>4;if(x<0||y<0||x>=MW||y>=MH)return 1;const i=idx(x,y);return SOL[i]||S.mach[i]};
/* ---------- state ---------- */
function newState(name){const s={v:1,name:name||'Farmer',day:1,season:0,year:1,time:360,abs:0,gold:500,energy:100,inv:Array(24).fill(null),sel:0,tools:{hoe:0,can:0,rod:0},water:20,
 soil:{},field:0,coop:0,barn:0,hay:0,animals:[],mach:{},fr:{},q:0,req:null,st:{planted:0,harvested:0,shipped:0,fish:0,artisan:0,upgrades:0,fests:0,champ:0,storms:0,years:0,board:0,legend:0,kinds:{},fishK:{}},
 ach:{},wx:'sun',wxN:'sun',bin:[],festDone:'',festSeen:'',won:0,grazed:0};
 [['hoe',1],['can',1],['rod',1],['s_turnip',12]].forEach((a,i)=>s.inv[i]={id:a[0],n:a[1]});NPCS.forEach(n=>s.fr[n.id]={p:0,t:0,g:0});return s}
const dn=()=>(S.year-1)*48+S.season*SEASON_DAYS+S.day,hearts=id=>Math.min(10,S.fr[id].p/100|0),isFest=()=>S.day==FEST_DAY;
function save(){try{localStorage.setItem(SAVE,JSON.stringify(S));return 1}catch(e){return 0}}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE));if(s&&s.v==1)return s}catch(e){}return null}
function add(id,n=1){let s=S.inv.find(x=>x&&x.id==id);if(s){s.n+=n;hotbar();return 1}const i=S.inv.indexOf(null);if(i<0){toast('🎒 Your bag is full!');return 0}S.inv[i]={id,n};hotbar();return 1}
function take(id,n=1){const s=S.inv.find(x=>x&&x.id==id);if(!s||s.n<n)return 0;s.n-=n;if(s.n<=0)S.inv[S.inv.indexOf(s)]=null;hotbar();return 1}
const count=id=>{const s=S.inv.find(x=>x&&x.id==id);return s?s.n:0};
/* ---------- audio ---------- */
let AC=null,MG,MUS,SG,NB,RG,seqT=0,step=0,musOn=1,sfxOn=1,MEL=[];
const mf=m=>440*2**((m-69)/12);
function audio(){if(AC){AC.state=='suspended'&&AC.resume();return}try{AC=new(window.AudioContext||window.webkitAudioContext)();MG=AC.createGain();MG.gain.value=.55;MG.connect(AC.destination);
 MUS=AC.createGain();MUS.gain.value=.2;MUS.connect(MG);SG=AC.createGain();SG.gain.value=.6;SG.connect(MG);NB=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 const rs=AC.createBufferSource();rs.buffer=NB;rs.loop=true;const rf=AC.createBiquadFilter();rf.type='bandpass';rf.frequency.value=2500;RG=AC.createGain();RG.gain.value=0;rs.connect(rf);rf.connect(RG);RG.connect(MG);rs.start();
 MEL=MUSIC.map(M=>{const r=rngF(M.seed),m=[];let d=M.sc.length;for(let i=0;i<32;i++){if(r()<.3&&i%8)m.push(-1);else{d=cl(d+Math.round((r()-.5)*4),0,M.sc.length*2-1);m.push(d)}}return m});
 seqT=AC.currentTime+.1;setInterval(sched,50)}catch(e){AC=null}}
function tone(f,t,d,w,v,dst,f2){const o=AC.createOscillator(),g=AC.createGain();o.type=w;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(dst);o.start(t);o.stop(t+d+.05)}
function noise(t,d,v,fq,ty,dst){const s=AC.createBufferSource();s.buffer=NB;const f=AC.createBiquadFilter();f.type=ty||'lowpass';f.frequency.value=fq;const g=AC.createGain();
 g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(dst||SG);s.start(t,Math.random());s.stop(t+d+.05)}
const note=(M,d)=>M.root+12*Math.floor(d/M.sc.length)+M.sc[d%M.sc.length];
function sched(){if(!AC)return;const si=S?S.season:0,M=MUSIC[si],e=60/M.bpm/2;if(seqT<AC.currentTime)seqT=AC.currentTime+.05;
 while(seqT<AC.currentTime+.25){if(musOn){const s=step,t=seqT,bar=(s>>3)%4,dg=M.prog[bar],night=S&&S.time>=1200,wet=S&&/rain|storm/.test(S.wx);
  if(s%4==0)tone(mf(note(M,dg)-24),t,e*3.2,'triangle',.55,MUS);
  tone(mf(note(M,dg+[0,2,4,2][s%4])-12),t,e*.8,'square',.07,MUS);
  const m=MEL[si][s%32];if(m>=0&&!night)tone(mf(note(M,m)),t,e*(MEL[si][(s+1)%32]<0?1.8:.9),M.w,.16,MUS);
  if(s%2==0&&!wet)noise(t,.03,.06,8000,'highpass',MUS)}
 seqT+=e;step++}}
const SFX={till:t=>{noise(t,.14,.5,500);tone(110,t,.12,'sine',.4,SG,50)},water:t=>noise(t,.35,.3,1800,'bandpass'),plant:t=>tone(500,t,.1,'sine',.3,SG,900),
 harvest:t=>[0,4,7,12].forEach((n,i)=>tone(mf(72+n),t+i*.06,.15,'square',.1,SG)),coin:t=>{tone(mf(83),t,.08,'square',.1,SG);tone(mf(88),t+.07,.25,'square',.1,SG)},
 sel:t=>tone(900,t,.04,'square',.05,SG),talk:t=>{for(let i=0;i<4;i++)tone(300+Math.random()*300,t+i*.06,.05,'square',.05,SG)},bite:t=>{tone(1200,t,.1,'square',.12,SG);tone(1500,t+.1,.1,'square',.12,SG)},
 catch:t=>[0,4,7,12,16].forEach((n,i)=>tone(mf(76+n),t+i*.07,.2,'square',.1,SG)),lose:t=>tone(300,t,.4,'sawtooth',.08,SG,90),thunder:t=>noise(t,1.8,.7,260),
 ach:t=>[0,7,12,16,19,24].forEach((n,i)=>tone(mf(72+n),t+i*.08,.3,'triangle',.18,SG)),err:t=>tone(140,t,.15,'square',.08,SG),pop:t=>tone(700,t,.08,'triangle',.2,SG,1200),
 sleep:t=>[12,7,4,0].forEach((n,i)=>tone(mf(64+n),t+i*.2,.5,'triangle',.15,SG)),splash:t=>noise(t,.3,.35,1200,'bandpass'),moo:t=>tone(200,t,.4,'sawtooth',.06,SG,150),
 cluck:t=>{tone(900,t,.05,'square',.05,SG,600);tone(900,t+.08,.05,'square',.05,SG,600)},reel:t=>tone(1800,t,.02,'square',.02,SG)};
function sfx(n){if(AC&&sfxOn)try{SFX[n](AC.currentTime)}catch(e){}}
/* ---------- fx ---------- */
function spark(x,y,c,n,up){for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*60,vy:-Math.random()*(up||60)-10,l:.5+Math.random()*.6,c:Array.isArray(c)?c[i%c.length]:c,s:Math.random()<.4?2:1})}
function flt(x,y,txt,c){floats.push({x,y,txt,c:c||'#fff',t:0})}
function toast(m,cls){const d=document.createElement('div');d.className='toast '+(cls||'');d.textContent=m;const b=$('toasts');b.appendChild(d);while(b.children.length>4)b.firstChild.remove();setTimeout(()=>d.remove(),3200)}
/* ---------- render ---------- */
function renderGround(){const key=S.season+'|'+S.field;if(gKey==key)return;gKey=key;ground=ground||document.createElement('canvas');ground.width=MW*16;ground.height=MH*16;
 const g=ground.getContext('2d'),C=SCOL[S.season],r=rngF(99),win=S.season==3;
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const v=T[idx(x,y)],X=x*16,Y=y*16,nb=(dx,dy)=>T[idx(cl(x+dx,0,MW-1),cl(y+dy,0,MH-1))];
  if(v==0||v==5){R(g,X,Y,16,16,C.g);for(let k=0;k<5;k++)R(g,X+r()*15,Y+r()*15,1+(r()*2|0),1,r()<.5?C.g2:C.g3);if(C.fl.length&&r()<.05&&v==0){R(g,X+4+r()*8,Y+4+r()*8,2,2,C.fl[r()*C.fl.length|0])}}
  else if(v==1){R(g,X,Y,16,16,win?'#d8cdbd':'#c9a26e');for(let k=0;k<4;k++)R(g,X+r()*15,Y+r()*15,2,1,win?'#c4b8a8':'#b08a58')}
  else if(v==2){R(g,X,Y,16,16,win?'#86bfe2':'#3c8fd4');if(nb(0,-1)!=2)R(g,X,Y,16,3,win?'#c8e4f4':'#8ad0f5');R(g,X+r()*12,Y+6+r()*8,3,1,win?'#a4d0ec':'#4a9fe0')}
  else if(v==3){R(g,X,Y,16,16,win?'#e8e4da':'#e6d29a');for(let k=0;k<3;k++)R(g,X+r()*15,Y+r()*15,1,1,'#cbb47c')}
  else if(v==4){R(g,X,Y,16,16,'#bdb5aa');R(g,X,Y+7,16,1,'#a8a096');R(g,X+((y%2)?4:12),Y,1,7,'#a8a096');R(g,X+((y%2)?10:2),Y+8,1,8,'#a8a096');if(win)R(g,X+r()*12,Y+r()*12,4,2,'#eef2f6')}
  if(v==5){const h=nb(-1,0)==5||nb(1,0)==5,vt=nb(0,-1)==5||nb(0,1)==5;if(h){R(g,X,Y+6,16,2,'#b07a3e');R(g,X,Y+11,16,2,'#b07a3e')}if(vt)R(g,X+7,Y,2,16,'#b07a3e');R(g,X+6,Y+3,4,12,'#7a4a24');R(g,X+6,Y+3,4,1,win?'#fff':'#9a6a3a')}}
 const f=FIELDS[S.field];g.fillStyle='rgba(90,60,30,.35)';for(let x=f[0]*16;x<(f[2]+1)*16;x+=6){g.fillRect(x,f[1]*16-1,3,1);g.fillRect(x,(f[3]+1)*16,3,1)}for(let y=f[1]*16;y<(f[3]+1)*16;y+=6){g.fillRect(f[0]*16-1,y,1,3);g.fillRect((f[2]+1)*16,y,1,3)}
 [[f[0],f[1]],[f[2]+1,f[1]],[f[0],f[3]+1],[f[2]+1,f[3]+1]].forEach(p=>R(g,p[0]*16-2,p[1]*16-2,4,4,'#8a8a8a'))}
const nightA=()=>{const h=S.time/60;return h<17?0:h<20?(h-17)/3*.5:Math.min(.68,.5+(h-20)*.04)};
function win(c,x,y,on){R(c,x,y,8,8,'#5a3a20');R(c,x+1,y+1,6,6,on?'#ffd870':'#9ad0ee');R(c,x+4,y+1,1,6,'#5a3a20');R(c,x+1,y+4,6,1,'#5a3a20');if(on)LIGHTS.push([x+4,y+4,18])}
function house(c,X,Y,W,H,roof,wall,on){const rh=Math.min(30,H*.5|0);R(c,X+2,Y+rh,W-4,H-rh,wall);for(let y=Y+rh+4;y<Y+H;y+=5)R(c,X+2,y,W-4,1,'rgba(0,0,0,.08)');
 R(c,X,Y+4,W,rh,roof);for(let y=Y+8;y<Y+rh+4;y+=5)R(c,X,y,W,1,'rgba(0,0,0,.15)');R(c,X+3,Y,W-6,5,roof);R(c,X+3,Y,W-6,1,'rgba(255,255,255,.25)');R(c,X-1,Y+rh+2,W+2,2,'rgba(0,0,0,.25)');
 R(c,X+W/2-5,Y+H-13,10,13,'#6a4028');R(c,X+W/2+2,Y+H-7,1,1,'#ffd23a');win(c,X+7,Y+H-14,on);if(W>48)win(c,X+W-15,Y+H-14,on);if(S.season==3)R(c,X,Y+2,W,3,'#f6f9fc')}
function drawB(b){const c=cx,X=b.x*16,Y=b.y*16,W=b.w*16,H=b.h*16,on=nightA()>.15;
 switch(b.k){
 case'house':house(c,X,Y,W,H,'#c8503a','#ead2a2',on);R(c,X+W-18,Y-6,7,12,'#8a5a4a');break;
 case'home':house(c,X,Y,W,H,b.c,'#e8dcc4',on);break;
 case'shop':house(c,X,Y,W,H,'#4a9a5a','#f0e2c0',on);for(let i=0;i<W;i+=8)R(c,X+i,Y+H-22,8,5,i%16?'#fff':'#e05050');R(c,X+W/2-10,Y+H-32,20,8,'#8a5a30');R(c,X+W/2-6,Y+H-30,4,4,'#7acc50');R(c,X+W/2+2,Y+H-30,4,4,'#e8344a');break;
 case'forge':house(c,X,Y,W,H,'#5a5a6a','#b8a898',on);R(c,X+W-18,Y-10,10,16,'#6a6a72');if(Math.random()<.05)parts.push({x:X+W-13,y:Y-12,vx:3,vy:-12,l:2,c:'rgba(200,200,200,.6)',s:3});R(c,X+6,Y+H-6,10,4,'#3a3a44');R(c,X+8,Y+H-9,6,3,'#3a3a44');break;
 case'hall':house(c,X,Y,W,H,'#3a5a9a','#efe8d8',on);R(c,X+W/2-1,Y-14,2,14,'#555');R(c,X+W/2+1,Y-14,9,6,'#e8c050');R(c,X+W/2-5,Y+8,10,10,'#fff');R(c,X+W/2,Y+10,1,4,'#333');break;
 case'sage':house(c,X,Y,W,H,'#7a5aa0','#e8e0d0',on);[[X+2,Y+H-5],[X+W-8,Y+H-5]].forEach(p=>{R(c,p[0],p[1],6,5,'#b06a3a');R(c,p[0]+1,p[1]-4,4,4,'#5aa04a')});break;
 case'coop':if(!S.coop)return plot(c,X,Y,W,H);house(c,X,Y,W,H,'#d0603a','#f0e0c0',on);R(c,X+4,Y+H-4,10,4,'#a8743a');if(S.coop>1)R(c,X+W-10,Y+10,6,6,'#ffd23a');break;
 case'barn':if(!S.barn)return plot(c,X,Y,W,H);R(c,X+2,Y+24,W-4,H-24,'#b83a32');R(c,X,Y+4,W,24,'#7a2a26');R(c,X+4,Y,W-8,6,'#7a2a26');R(c,X+W/2-12,Y+H-24,24,24,'#f4f0e8');R(c,X+W/2-10,Y+H-22,20,22,'#8a2a26');
  c.fillStyle='#f4f0e8';for(let i=0;i<20;i++){c.fillRect(X+W/2-10+i,Y+H-22+i*1.1,2,2);c.fillRect(X+W/2+9-i,Y+H-22+i*1.1,2,2)}if(S.season==3)R(c,X,Y+2,W,3,'#fff');if(S.barn>1)R(c,X+8,Y+10,6,6,'#ffd23a');break;
 case'bin':R(c,X,Y+15,16,2,'rgba(0,0,0,.25)');R(c,X+1,Y+5,14,11,'#9a6a3a');R(c,X,Y+2,16,4,'#c08a4a');R(c,X+1,Y+9,14,1,'#7a4a2a');R(c,X+6,Y+3,4,1,'#fff');if(S.bin.length)R(c,X+3,Y,10,3,'#e8c050');break;
 case'board':R(c,X+1,Y+4,2,12,'#6a4024');R(c,X+13,Y+4,2,12,'#6a4024');R(c,X-3,Y-4,22,13,'#9a6a3a');R(c,X-2,Y-3,20,11,'#c89a5a');R(c,X,Y-2,6,7,'#fff');R(c,X+8,Y-1,7,6,'#f4e8c8');
  if(S.req&&!S.req.done){R(c,X+2,Y-1,2,2,'#e03030');if((now*2|0)%2)R(c,X+6,Y-12,3,6,'#ffd23a'),R(c,X+6,Y-5,3,2,'#ffd23a')}break;
 case'fount':R(c,X+1,Y+14,46,32,'#9a948e');R(c,X+4,Y+17,40,26,'#5aa8e0');R(c,X+4,Y+17,40,3,'#8ad0f5');R(c,X+20,Y+4,8,24,'#c8c0b8');R(c,X+16,Y+2,16,4,'#d8d0c8');
  for(let i=0;i<4;i++){const a=(now*1.5+i/4)%1;R(c,X+23+(i%2?6:-6)*a,Y+2+a*20,2,2,'#bfe6ff')}break}}
function plot(c,X,Y,W,H){R(c,X+4,Y+H-28,W-8,24,'rgba(120,80,40,.35)');R(c,X+W/2-1,Y+H-26,2,14,'#7a4a24');R(c,X+W/2-8,Y+H-30,16,9,'#c89a5a');R(c,X+W/2-5,Y+H-27,10,1,'#6a4024');R(c,X+W/2-5,Y+H-24,7,1,'#6a4024')}
function drawTree(x,y){const X=x*16,Y=y*16,C=SCOL[S.season],c=cx,sw=Math.sin(now*1.5+x)*.6;
 R(c,X+2,Y+13,12,3,'rgba(0,0,0,.2)');R(c,X+6,Y+2,4,13,'#7a4a2a');R(c,X+6,Y+2,1,13,'#5a3418');
 if(S.season==3){R(c,X+2,Y-6,2,8,'#6a4024');R(c,X+11,Y-8,2,10,'#6a4024');R(c,X+1,Y-8,4,2,'#fff');R(c,X+10,Y-10,4,2,'#fff');R(c,X+5,Y-10,6,12,'#6a4a30');R(c,X+5,Y-11,6,2,'#fff');return}
 const o=sw|0;R(c,X-3+o,Y-12,22,14,C.lf);R(c,X-1+o,Y-16,18,22,C.lf);R(c,X+1+o,Y-18,14,4,C.lf2);R(c,X-1+o,Y-12,4,4,C.lf2);R(c,X+9+o,Y-14,5,3,C.lf2);R(c,X-3+o,Y,22,2,'rgba(0,0,0,.15)');
 if(C.bl)[[1,-10],[10,-14],[6,-4],[13,-6]].forEach(p=>R(c,X+p[0]+o,Y+p[1],2,2,C.bl));if(S.season==1&&(x*7+y)%5==0)[[2,-6],[11,-9]].forEach(p=>R(c,X+p[0]+o,Y+p[1],3,3,'#e83a3a'))}
function stage(cr){const C=CROPS[cr.k],f=cr.a/C.d;return f>=1?4:f<=0?0:f<.34?1:f<.67?2:3}
function render(){const W=MW*16,H=MH*16,sx=shake>0?(Math.random()-.5)*shake*4|0:0;camX=Math.round(cl(P.x-VW/2,0,Math.max(0,W-VW)));camY=Math.round(cl(P.y-8-VH/2,0,Math.max(0,H-VH)));
 LIGHTS=[];cx.fillStyle='#2a6a2a';cx.fillRect(0,0,VW,VH);cx.save();cx.translate(sx,0);cx.drawImage(ground,camX,camY,VW,VH,0,0,VW,VH);cx.translate(-camX,-camY);
 const x0=Math.max(0,camX>>4),y0=Math.max(0,camY>>4),x1=Math.min(MW-1,(camX+VW)>>4),y1=Math.min(MH-1,(camY+VH)>>4);
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=idx(x,y),X=x*16,Y=y*16;
  if(T[i]==2&&((x*3+y*5+(now*2|0))%7==0))R(cx,X+4+(now*6%6),Y+8,4,1,'rgba(255,255,255,.5)');
  const s=S.soil[i];if(s){R(cx,X,Y,16,16,s.w?'#5a3a22':'#8f6038');R(cx,X+1,Y+4,14,1,s.w?'#4a2e1a':'#7a4e2c');R(cx,X+1,Y+10,14,1,s.w?'#4a2e1a':'#7a4e2c');if(!s.w&&S.season==3)R(cx,X+2,Y+2,3,1,'#fff');
   if(s.c)drawCrop(cx,X,Y,CROPS[s.c.k],stage(s.c),s.c.dead)}}
 const L=[],vis=(x,y,m)=>x>camX-m&&x<camX+VW+m&&y>camY-m&&y<camY+VH+m+40;
 for(const t of TREES)if(vis(t[0]*16,t[1]*16,24))L.push([t[1]*16+16,()=>drawTree(t[0],t[1])]);
 for(const b of BLD)if(vis(b.x*16,b.y*16,b.w*16))L.push([(b.y+b.h)*16,()=>drawB(b)]);
 for(const k in S.mach){const m=S.mach[k],x=k%MW,y=k/MW|0;L.push([y*16+16,()=>{drawMachine(cx,m.id,x*16,y*16+16,m.it);if(m.it&&S.abs>=m.done){const b=Math.sin(now*5)*2;R(cx,x*16+3,y*16-14+b,10,10,'#fff');drawItem(cx,m.o,x*16+1,y*16-16+b)}}])}
 for(const l of LAMPS)L.push([l[1]*16+15,()=>{const X=l[0]*16,Y=l[1]*16;R(cx,X+7,Y-6,2,21,'#3a3a44');R(cx,X+5,Y-10,6,6,'#3a3a44');R(cx,X+6,Y-9,4,4,nightA()>.1?'#ffe08a':'#c8d0d8');if(nightA()>.1)LIGHTS.push([X+8,Y-7,34])}]);
 for(const n of npcs)if(n.vis)L.push([n.y,()=>{drawPerson(cx,n.x,n.y,n.dir,n.fr,n.d.col);if(S.fr[n.d.id].t!=dn()){R(cx,n.x-2,n.y-28+Math.sin(now*4)*1.5,4,4,'#fff');R(cx,n.x-1,n.y-27+Math.sin(now*4)*1.5,2,2,'#e8a020')}}]);
 for(const a of S.animals)if(a.out)L.push([a.y,()=>{const f=a.m?(now*6|0)%4:0;a.t=='chicken'?drawChicken(cx,a.x,a.y,f):a.t=='cow'?drawCow(cx,a.x,a.y,f,a.fl):drawSheep(cx,a.x,a.y,f,a.fl,!a.rdy&&a.d%2);
  if(a.rdy){const b=Math.sin(now*4+a.x)*1.5;drawItem(cx,ANIM[a.t].prod,a.x-8,a.y-28+b)}}]);
 if(mode!='title')L.push([P.y,drawPlayer]);L.sort((a,b)=>a[0]-b[0]);for(const l of L)l[1]();
 if(isFest()&&vis(42*16,19*16,300))for(let x=42*16;x<60*16;x+=8){const yy=19*16-6+Math.sin(x*.05)*3;R(cx,x,yy,8,1,'#8a5a30');R(cx,x+1,yy+1,5,3,['#e8445a','#ffd23a','#4aa0e8','#6ac04a'][(x>>3)%4]);R(cx,x+2,yy+4,3,1,['#e8445a','#ffd23a','#4aa0e8','#6ac04a'][(x>>3)%4]);if((x>>3)%6==0)LIGHTS.push([x+4,yy+4,14])}
 if(fish){const b=fish.b,bx=b[0]*16+8,by=b[1]*16+8+(fish.ph=='bite'?Math.sin(now*30)*2:Math.sin(now*3));cx.strokeStyle='rgba(255,255,255,.7)';cx.lineWidth=1;cx.beginPath();cx.moveTo(P.x+DIRV[P.dir][0]*10,P.y-18);cx.lineTo(bx,by);cx.stroke();R(cx,bx-2,by-2,4,4,'#e83a3a');R(cx,bx-2,by-2,4,2,'#fff');
  if(fish.ph=='bite'){R(cx,P.x-2,P.y-36,4,9,'#ffd23a');R(cx,P.x-2,P.y-25,4,3,'#ffd23a')}}
 for(const p of parts){cx.fillStyle=p.c;cx.globalAlpha=Math.min(1,p.l*2);if(p.s==2){cx.fillRect(p.x-1,p.y,3,1);cx.fillRect(p.x,p.y-1,1,3)}else cx.fillRect(p.x,p.y,p.s,p.s)}cx.globalAlpha=1;
 cx.restore();
 const wx=S.wx;if(wx=='rain'||wx=='storm'){cx.fillStyle='rgba(30,50,90,.22)';cx.fillRect(0,0,VW,VH);cx.fillStyle='rgba(170,200,255,.6)';for(const d of drops)cx.fillRect(d.x,d.y,1,4)}
 else if(wx=='snow'){cx.fillStyle='rgba(255,255,255,.85)';for(const d of drops)cx.fillRect(d.x,d.y,d.s,d.s)}else if(wx=='cloud'){cx.fillStyle='rgba(60,70,90,.12)';cx.fillRect(0,0,VW,VH)}
 const na=nightA();if(na>0){cx.fillStyle=`rgba(14,18,58,${na})`;cx.fillRect(0,0,VW,VH);cx.globalCompositeOperation='lighter';for(const l of LIGHTS){const x=l[0]-camX,y=l[1]-camY,g=cx.createRadialGradient(x,y,0,x,y,l[2]);g.addColorStop(0,`rgba(255,190,110,${na*.6})`);g.addColorStop(1,'rgba(255,190,110,0)');cx.fillStyle=g;cx.fillRect(x-l[2],y-l[2],l[2]*2,l[2]*2)}cx.globalCompositeOperation='source-over'}
 if(flash>0){cx.fillStyle=`rgba(255,255,255,${flash})`;cx.fillRect(0,0,VW,VH)}
 drawUI()}
function drawPlayer(){const tool=P.act>0;drawPerson(cx,P.x,P.y,P.dir,P.fr,PL);
 if(tool){const it=S.inv[S.sel];if(it){const d=DIRV[P.dir],k=1-P.act/.28;cx.save();cx.translate(P.x+d[0]*9,P.y-12+d[1]*6-(1-k)*5);drawItem(cx,it.id,-8,-8);cx.restore()}}}
function drawUI(){ux.setTransform(1,0,0,1,0,0);ux.clearRect(0,0,uc.width,uc.height);const z=SC*DPR;ux.textAlign='center';ux.font=`bold ${Math.round(13*DPR)}px system-ui,sans-serif`;
 for(const f of floats){const a=1-f.t/1.3;ux.globalAlpha=Math.max(0,a);ux.lineWidth=3*DPR;ux.strokeStyle='rgba(40,25,10,.9)';const X=(f.x-camX)*z,Y=(f.y-camY-f.t*22)*z;ux.strokeText(f.txt,X,Y);ux.fillStyle=f.c;ux.fillText(f.txt,X,Y)}ux.globalAlpha=1;
 if(fish&&fish.ph=='reel'){const h=Math.min(uc.height*.5,260*DPR),w=34*DPR,X=uc.width/2+60*DPR,Y=uc.height/2-h/2,F=fish;
  ux.fillStyle='#5a3a20';ux.fillRect(X-6*DPR,Y-6*DPR,w+12*DPR+16*DPR,h+12*DPR);ux.fillStyle='#2a5a8a';ux.fillRect(X,Y,w,h);
  ux.fillStyle=F.in?'rgba(110,230,110,.85)':'rgba(110,200,110,.55)';ux.fillRect(X+2*DPR,Y+h*(1-F.by-F.bh),w-4*DPR,h*F.bh);
  const fy=Y+h*(1-F.fy)-8*DPR;ux.fillStyle=FISH[F.f].c;ux.fillRect(X+8*DPR,fy,w-16*DPR,14*DPR);ux.fillStyle='#222';ux.fillRect(X+11*DPR,fy+4*DPR,3*DPR,3*DPR);
  ux.fillStyle='#333';ux.fillRect(X+w+4*DPR,Y,10*DPR,h);ux.fillStyle=F.p>.3?'#7ae05a':'#e8a03a';ux.fillRect(X+w+5*DPR,Y+h*(1-F.p),8*DPR,h*F.p);
  ux.fillStyle='#fff';ux.font=`bold ${Math.round(12*DPR)}px system-ui`;ux.fillText(isTouch?'Hold ✋ to reel':'Hold SPACE to reel',X+w/2,Y+h+24*DPR)}}
/* ---------- UI: hud/hotbar ---------- */
const icache={};function icon(id){const k=id+(ITEMS[id]&&ITEMS[id].tool?S.tools[id]:'');if(!icache[k]){const c=document.createElement('canvas');c.width=c.height=16;drawItem(c.getContext('2d'),id,0,0);icache[k]=c.toDataURL()}return icache[k]}
const pcache={};function portrait(n){if(!pcache[n.id]){const c=document.createElement('canvas');c.width=12;c.height=12;drawPerson(c.getContext('2d'),6,18,0,0,n.col);pcache[n.id]=c.toDataURL()}return pcache[n.id]}
function hud(){const h=S.time/60|0,m=S.time%60,hh=h%24,ap=hh<12?'AM':'PM';$('hDate').textContent=`${SEASONS[S.season]} ${S.day} · Y${S.year}`;$('hTime').textContent=`${hh%12||12}:${String(m).padStart(2,'0')} ${ap}`;
 $('hWx').textContent=WXI[S.wx];$('gold').textContent=fmt(S.gold)+'g';$('efill').style.width=S.energy+'%';$('efill').style.background=S.energy<20?'#e8503a':S.energy<50?'#f2b134':'#6ac04a'}
function hotbar(){if(!S)return;let h='';for(let i=0;i<10;i++){const s=S.inv[i];h+=`<button class="slot${i==S.sel?' on':''}" data-a="sel" data-v="${i}">${s?`<img src="${icon(s.id)}" alt="">${ITEMS[s.id]&&ITEMS[s.id].tool?'':`<b>${s.n}</b>`}`:''}<i>${(i+1)%10}</i></button>`}
 $('hotbar').innerHTML=h;const s=S.inv[S.sel];$('selName').textContent=s?itemInfo(s.id).n+(s.id=='can'?` (${S.water}/${canCap()})`:ITEMS[s.id]&&ITEMS[s.id].tool?' · '+TOOL_LV[S.tools[s.id]]:''):''}
const canCap=()=>[20,35,55,80][S.tools.can];
/* ---------- gameplay ---------- */
function faceTile(){const d=DIRV[P.dir];return[(P.x+d[0]*12)>>4,(P.y-5+d[1]*13)>>4]}
function area(tool,tx,ty){const l=S.tools[tool],[dx,dy]=DIRV[P.dir],o=[];if(l==3){for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)o.push([tx+dx+a,ty+dy+b])}else for(let k=0;k<[1,3,5][l];k++)o.push([tx+dx*k,ty+dy*k]);return o.filter(p=>p[0]>=0&&p[1]>=0&&p[0]<MW&&p[1]<MH)}
function canTill(x,y){const i=idx(x,y),s=S.soil[i];if(s)return s.c&&s.c.dead;return inField(x,y)&&!SOL[i]&&!S.mach[i]&&T[i]==0}
function target(tx,ty){const px=tx*16+8,py=ty*16+8,it=S.inv[S.sel],id=it&&it.id,I=id&&itemInfo(id);
 for(const n of npcs)if(n.vis&&Math.abs(n.x-px)<13&&Math.abs(n.y-8-py)<15)return{k:'npc',o:n,l:'Talk to '+n.d.n,e:'💬'};
 for(const a of S.animals)if(a.out&&Math.abs(a.x-px)<13&&Math.abs(a.y-5-py)<13)return{k:'anim',o:a,l:a.rdy?'Collect '+itemInfo(ANIM[a.t].prod).n:a.pt==dn()?a.n+' ♥':'Pet '+a.n,e:'✋'};
 const b=bldAt(tx,ty);if(b){const L={house:'Go to bed',bin:'Open shipping bin',coop:S.coop?'Check coop':'Coop site (build at forge)',barn:S.barn?'Check barn':'Barn site (build at forge)',shop:'Shop at June\'s',forge:'Visit Rowan\'s forge',hall:isFest()?'Festival contest (talk to Bram)':'Town Hall',sage:"Sage's Apothecary",board:'Read bulletin board',fount:'Toss a coin (1g)',home:b.who}[b.k];return{k:'bld',o:b,l:L,e:'🚪'}}
 const i=idx(tx,ty),m=S.mach[i];if(m){const M=MACH[m.id],rd=m.it&&S.abs>=m.done;return{k:'mach',o:m,i,l:rd?'Collect '+itemInfo(m.o).n:m.it?'Working… '+Math.max(1,Math.ceil((m.done-S.abs)/60))+'h left':'Add '+(M.i=='crop'?'a crop':itemInfo(M.i).n),e:'⚙️'}}
 const so=S.soil[i];if(so&&so.c&&!so.c.dead&&stage(so.c)==4)return{k:'harv',i,l:'Harvest '+CROPS[so.c.k].n,e:'🧺'};
 if(!id)return null;
 if(T[i]==2){if(id=='rod')return{k:'fish',b:[tx,ty],l:'Cast line',e:'🎣'};if(id=='can')return{k:'refill',l:'Refill can',e:'💧'};return null}
 if(id=='hoe'&&area('hoe',tx,ty).some(p=>canTill(p[0],p[1])))return{k:'hoe',l:so&&so.c?'Clear dead crop':'Till soil',e:'⛏️'};
 if(id=='can'&&area('can',tx,ty).some(p=>{const s=S.soil[idx(p[0],p[1])];return s&&!s.w}))return{k:'can',l:S.water?'Water soil':'Can is empty – refill at water',e:'💧'};
 if(I.seed&&so&&!so.c)return{k:'seed',i,l:CROPS[I.seed].s==S.season?'Plant '+CROPS[I.seed].n:'Out of season!',e:'🌱'};
 if(I.place&&!SOL[i]&&!so&&tx<37&&T[i]!=2)return{k:'place',i,l:'Place '+I.n,e:'⚙️'};
 return null}
function act(tx,ty){if(fish)return fishPress();if(mode!='play'||panelOn)return;if(tx==null)[tx,ty]=faceTile();const t=target(tx,ty);audio();
 if(!t){if(S.inv[S.sel]&&ITEMS[S.inv[S.sel].id]&&ITEMS[S.inv[S.sel].id].tool){P.act=.2}return}
 const it=S.inv[S.sel],id=it&&it.id;
 switch(t.k){
 case'npc':{const n=t.o,d=[P.x-n.x,P.y-n.y];n.dir=Math.abs(d[0])>Math.abs(d[1])?(d[0]<0?2:3):(d[1]<0?1:0);talkP(n);break}
 case'anim':{const a=t.o;if(a.rdy)A.col(S.animals.indexOf(a));else if(a.pt!=dn()){A.pet(S.animals.indexOf(a));spark(a.x,a.y-14,'#ff6a8a',6,40);flt(a.x,a.y-18,'♥','#ff8aa8')}break}
 case'bld':{const b=t.o,h=S.time/60;if(b.k=='house')sleepP();else if(b.k=='bin')binP();else if(b.k=='coop'||b.k=='barn'){S[b.k]?animP(b.k):toast('🔨 Ask Rowan at the forge to build a '+b.k)}
  else if(b.k=='shop'){h>=8&&h<20||isFest()?shop():toast('🕗 June\'s store is open 8:00 AM – 8:00 PM')}else if(b.k=='forge'){h>=8&&h<20?forge():toast('🕗 The forge is open 8:00 AM – 8:00 PM')}
  else if(b.k=='board')boardP();else if(b.k=='fount'){if(S.gold>0){S.gold--;hud();sfx('splash');spark(51*16,24*16,['#bfe6ff','#ffd23a'],12,70);toast(['✨ You make a wish…','✨ The water sparkles.','✨ Good luck feels closer.'][dn()%3])}}
  else toast(t.l);break}
 case'mach':{const m=t.o,M=MACH[m.id];if(m.it&&S.abs>=m.done){if(add(m.o)){S.st.artisan++;sfx('harvest');spark(t.i%MW*16+8,(t.i/MW|0)*16,['#ffd23a','#fff'],12);flt(t.i%MW*16+8,(t.i/MW|0)*16-6,'+1 '+itemInfo(m.o).n);m.it=0;chk()}}
  else if(!m.it){const ok=id&&(M.i=='crop'?id[0]=='c'&&id[1]=='_':id==M.i);if(ok){take(id);m.it=id;m.o=M.i=='crop'?'p_'+id.slice(2):M.o;m.done=S.abs+M.t;sfx('pop');toast('⚙️ '+itemInfo(m.id).n+' started!')}else{sfx('err');toast('Select '+(M.i=='crop'?'a crop':itemInfo(M.i).n)+' in your hotbar first')}}
  else toast('⚙️ '+t.l);break}
 case'harv':{const s=S.soil[t.i],C=CROPS[s.c.k],n=Math.random()<.12?2:1;if(!add('c_'+s.c.k,n))return;S.st.harvested+=n;S.st.kinds[s.c.k]=1;if(C.r)s.c.a=C.d-C.r;else s.c=null;
  const x=t.i%MW*16+8,y=(t.i/MW|0)*16+6;spark(x,y,[C.c,'#fff','#ffd23a'],14,90);flt(x,y-6,'+'+n+' '+C.n,'#fff');sfx('harvest');P.act=.28;chk();break}
 case'fish':if(!use(3))return;fish={ph:'wait',t:1+Math.random()*3,b:t.b,loc:t.b[1]>=36?'river':'pond'};sfx('splash');P.act=.28;break;
 case'refill':S.water=canCap();sfx('water');spark(tx*16+8,ty*16+8,'#8ad0f5',10);flt(P.x,P.y-24,'💧 Full','#bfe6ff');hotbar();P.act=.28;break;
 case'hoe':{if(!use(2))return;let n=0;for(const p of area('hoe',tx,ty))if(canTill(p[0],p[1])){S.soil[idx(p[0],p[1])]={w:/rain|storm/.test(S.wx)?1:0,c:null};spark(p[0]*16+8,p[1]*16+10,['#8f6038','#6a4024'],5,40);n++}sfx('till');shake=.15;P.act=.28;break}
 case'can':{if(!S.water){sfx('err');toast('💧 Your can is empty. Face the pond or river to refill.');return}if(!use(2))return;for(const p of area('can',tx,ty)){const s=S.soil[idx(p[0],p[1])];if(s&&!s.w&&S.water>0){s.w=1;S.water--;spark(p[0]*16+8,p[1]*16+6,'#8ad0f5',4,30)}}sfx('water');hotbar();P.act=.28;break}
 case'seed':{const k=itemInfo(id).seed;if(CROPS[k].s!=S.season){sfx('err');toast(`🌱 ${CROPS[k].n} only grows in ${SEASONS[CROPS[k].s]}.`);return}take(id);S.soil[t.i].c={k,a:0};S.st.planted++;sfx('plant');spark(tx*16+8,ty*16+10,'#7acc50',5,30);P.act=.2;chk();break}
 case'place':{take(id);S.mach[t.i]={id,it:0,o:'',done:0};sfx('till');spark(tx*16+8,ty*16+8,'#fff',8);toast('⚙️ '+itemInfo(id).n+' placed');break}}
 hud()}
function use(e){if(S.energy<e){sfx('err');toast('😵 Too tired! Eat something or go to bed.');return 0}S.energy=Math.max(0,S.energy-e);if(S.energy<15&&S.energy+e>=15)toast('🥱 You\'re getting tired…');return 1}
function fishPress(){if(fish.ph=='wait'){fish=null;toast('🎣 Reeled in too early!');sfx('err')}else if(fish.ph=='bite'){fish.ph='reel';fish.by=.3;fish.bh=[.22,.27,.32,.4][S.tools.rod];fish.bv=0;fish.fy=.5;fish.ft=.5;fish.p=.3;fish.tt=0}}
function pickFish(loc){const night=S.time>=1200,c=Object.keys(FISH).filter(k=>{const f=FISH[k];return(f.loc==loc||f.loc=='any')&&(f.sea==null||f.sea==S.season)&&(!f.night||night)});
 for(const k of c)if(FISH[k].rare&&Math.random()<FISH[k].rare)return k;const n=c.filter(k=>!FISH[k].rare);return n[Math.random()*n.length|0]}
function updFish(dt){const F=fish;F.t-=dt;if(F.ph=='wait'&&F.t<=0){F.ph='bite';F.t=.95;F.f=pickFish(F.loc);sfx('bite');shake=.2}
 else if(F.ph=='bite'&&F.t<=0){fish=null;toast('🐟 It got away…');sfx('lose')}
 else if(F.ph=='reel'){const D=FISH[F.f].df;F.bv+=(hold?2.6:-2.3)*dt;F.bv=cl(F.bv,-1.4,1.4);F.by+=F.bv*dt;if(F.by<0){F.by=0;F.bv*=-.3}if(F.by>1-F.bh){F.by=1-F.bh;F.bv*=-.3}
  F.tt-=dt;if(F.tt<=0){F.ft=Math.random();F.tt=.4+Math.random()*(1.6-D)}F.fy+=(F.ft-F.fy)*dt*(1+D*3.5)+(Math.random()-.5)*D*dt*2;F.fy=cl(F.fy,0,1);
  F.in=F.fy>=F.by&&F.fy<=F.by+F.bh;F.p+=F.in?(.4-.12*D)*dt:-(.16+.14*D)*dt;if(F.in&&Math.random()<.2)sfx('reel');
  if(F.p>=1){const k=F.f;fish=null;if(add('f_'+k)){S.st.fish++;S.st.fishK[k]=1;if(FISH[k].rare)S.st.legend=1;sfx('catch');spark(P.x,P.y-20,[FISH[k].c,'#fff','#ffd23a'],18,100);flt(P.x,P.y-28,'🐟 '+FISH[k].n+'!','#bfe6ff');toast(`🎣 Caught a ${FISH[k].n}!${FISH[k].rare?' ✨ Legendary!':''}`);chk()}}
  else if(F.p<=0){fish=null;toast('🐟 The fish escaped!');sfx('lose')}}}
/* ---------- day cycle ---------- */
function rollWx(dayNext,sea){if(dayNext==FEST_DAY)return'sun';const r=Math.random();if(sea==3)return r<.45?'sun':r<.65?'cloud':'snow';return r<.5?'sun':r<.65?'cloud':r<.9?'rain':'storm'}
function sleep(passed){mode='sleep';sfx('sleep');const f=$('fade');f.classList.add('on');setTimeout(()=>{const sum=newDay(passed);f.classList.remove('on');mode='play';openP(`🌅 ${SEASONS[S.season]} ${S.day}, Year ${S.year}`,sum)},900)}
function newDay(passed){let tot=0,ls='';for(const b of S.bin){const I=itemInfo(b.id),p=I.p*b.n;tot+=p;ls+=row(b.id,I.n+' ×'+b.n,'',`<b class="gold">${fmt(p)}g</b>`)}S.gold+=tot;S.st.shipped+=tot;S.bin=[];
 for(const k in S.soil){const s=S.soil[k];if(s.c&&!s.c.dead&&s.w)s.c.a++;s.w=0}
 for(const k in S.mach){const m=S.mach[k];if(m.it)m.done=Math.min(m.done,S.abs)}
 const graze=S.grazed;let unfed=0;for(const a of S.animals){let fed=graze;if(!fed&&S.hay>0){S.hay--;fed=1}if(fed){a.d++;if(!ANIM[a.t].every||a.d%ANIM[a.t].every==0)a.rdy=1;a.love=Math.min(1000,a.love+(a.pt==dn()?10:0))}else{unfed++;a.love=Math.max(0,a.love-20)}}
 let msg='';S.day++;if(S.day>SEASON_DAYS){S.day=1;S.season++;if(S.season>3){S.season=0;S.year++;S.st.years++}
  let w=0;for(const k in S.soil){const s=S.soil[k];if(s.c&&CROPS[s.c.k].s!=S.season){s.c.dead=1;w++}}msg+=`<p class="note">🍂 A new season begins: <b>${SEASONS[S.season]}</b>!${w?` ${w} out-of-season crops withered.`:''} New seeds are at June's store.</p>`}
 S.time=360;S.energy=passed?70:100;S.wx=S.wxN;S.wxN=rollWx(S.day+1,S.day+1>SEASON_DAYS?(S.season+1)%4:S.season);S.grazed=0;S.water=canCap();
 if(/rain|storm/.test(S.wx))for(const k in S.soil)S.soil[k].w=1;
 if(S.wx=='storm'){S.st.storms++;const c=Object.keys(S.soil).filter(k=>S.soil[k].c&&!S.soil[k].c.dead);if(c.length>5&&Math.random()<.25){const k=c[Math.random()*c.length|0];msg+=`<p class="note">⚡ Lightning struck your ${CROPS[S.soil[k].c.k].n} overnight!</p>`;S.soil[k].c=null}}
 genReq();P.x=6*16;P.y=7*16+14;P.dir=0;npcs.forEach(placeNpc);for(const a of S.animals)a.out=0;
 const h=`${passed?'<p class="note">😵 You passed out! Someone carried you home'+(passed.l?'… and took '+fmt(passed.l)+'g for the trouble.':'.')+'</p>':''}${msg}<p class="note">Weather: <b>${WXI[S.wx]} ${WXN[S.wx]}</b>${/rain|storm/.test(S.wx)?' (your crops are watered)':''}${isFest()?` · 🎉 Today is the <b>${FESTS[S.season]}</b> in the village plaza!`:''}</p>
 ${tot?'<h3>📦 Shipped yesterday</h3>'+ls+`<div class="row tot"><b>Total</b><b class="gold">+${fmt(tot)}g</b></div>`:'<p class="note">Nothing was shipped yesterday.</p>'}${unfed?`<p class="note">🌾 ${unfed} animal(s) went hungry. Buy hay at June's store!</p>`:''}${btn('sum',0,'☀️ Start the day','',' go')}`;
 if(tot)setTimeout(()=>{sfx('coin');for(let i=0;i<20;i++)setTimeout(()=>spark(P.x,P.y-20,['#ffd23a','#fff3a0'],2,120),i*30)},300);
 const ok=save();if(!ok)toast('⚠️ Saving is blocked in this browser');chk();hud();hotbar();return h}
function genReq(){const n=NPCS[Math.random()*NPCS.length|0],pool=Object.keys(CROPS).filter(k=>CROPS[k].s==S.season).map(k=>'c_'+k);
 if(S.animals.length)pool.push(...new Set(S.animals.map(a=>ANIM[a.t].prod)));pool.push('f_'+(S.season==3?'perch':'bluegill'),'f_carp','f_trout');
 const it=pool[Math.random()*pool.length|0],I=itemInfo(it),q=it[0]=='f'?1+(Math.random()*2|0):2+(Math.random()*4|0);
 S.req={npc:n.id,item:it,n:q,r:Math.round((I.p*q*1.8+80)/10)*10,done:0,txt:['Could anyone spare these? I\'d be so grateful!','I\'m cooking something special tonight.','It\'s for a little surprise. Don\'t ask!','Running low. Help a neighbor out?'][Math.random()*4|0]}}
function stat(k){const s=S.st;switch(k){case'met':return NPCS.filter(n=>S.fr[n.id].t>0).length;case'kinds':return Object.keys(s.kinds).length;case'animals':return S.animals.length;case'types':return new Set(S.animals.map(a=>a.t)).size;
 case'maxHeart':return Math.max(...NPCS.map(n=>hearts(n.id)));case'minHeart':return Math.min(...NPCS.map(n=>hearts(n.id)));case'goldTool':return+Object.values(S.tools).some(v=>v>=3);case'field':return S.field;
 case'chickens':return S.animals.filter(a=>a.t=='chicken').length;case'big':return S.animals.filter(a=>a.t!='chicken').length}return s[k]||0}
function chk(){let q;while((q=QUESTS[S.q])&&stat(q[2])>=q[3]){S.gold+=q[4];S.q++;toast(`📜 Quest complete: ${q[0]} (+${q[4]}g)`,'gold');sfx('ach');if(!QUESTS[S.q]&&!S.won){S.won=1;setTimeout(winP,1200)}}
 ACH.forEach((a,i)=>{if(!S.ach[i]&&stat(a[2])>=a[3]){S.ach[i]=1;toast('🏆 '+a[0],'ach');sfx('ach')}});hud()}
function winP(){spark(P.x,P.y-20,['#ffd23a','#e8445a','#4aa0e8','#6ac04a','#fff'],60,160);openP('🏆 Pride of the Hollow!',`<p class="note">You turned a forgotten plot into the heart of Harvest Hollow. Every story quest is complete. Congratulations, ${S.name}!</p><p class="note">Your farm stays open: chase every award, max out your friendships and grow all 12 crops.</p>${btn('close',0,'Keep farming','',' go')}`)}
function placeNpc(n){const h=S.time/60,s=n.d.sch;let p=s[0];for(const e of s)if(h>=e[0])p=e;if(isFest()&&h>=9&&h<22)p=[0,...n.d.fest];n.tx=p[1]*16+8;n.ty=p[2]*16+12;n.vis=h>=6&&h<22}
function updNpc(n,dt){const h=S.time/60,was=n.vis;placeNpc(n);if(!was&&n.vis){n.x=n.tx;n.y=n.ty}if(n.d.id=='pip'&&!isFest()){n.w=(n.w||0)-dt;if(n.w<=0){n.w=3+Math.random()*3;n.ox=(Math.random()-.5)*48;n.oy=(Math.random()-.5)*32}n.tx+=n.ox||0;n.ty+=n.oy||0}
 if(curT===n&&panelOn)return;const dx=n.tx-n.x,dy=n.ty-n.y,sp=34*dt;if(Math.abs(dx)>1){n.x+=Math.sign(dx)*Math.min(sp,Math.abs(dx));n.dir=dx<0?2:3;n.ft+=dt*7}else if(Math.abs(dy)>1){n.y+=Math.sign(dy)*Math.min(sp,Math.abs(dy));n.dir=dy<0?1:0;n.ft+=dt*7}else{n.ft=0;if(Math.abs(P.x-n.x)<40&&Math.abs(P.y-n.y)<40)n.dir=Math.abs(P.x-n.x)>Math.abs(P.y-n.y)?(P.x<n.x?2:3):(P.y<n.y?1:0);else n.dir=0}n.fr=n.ft?(n.ft|0)%4:0}
function updAnim(a,dt){const h=S.time/60,outOK=h>=7&&h<18&&S.season<3&&!/rain|storm/.test(S.wx);if(outOK&&!a.out){a.out=1;a.x=(23+Math.random()*12)*16;a.y=(8+Math.random()*6)*16}if(!outOK&&a.out)a.out=0;if(!a.out)return;
 if(outOK)S.grazed=1;a.w=(a.w||0)-dt;if(a.w<=0){a.w=1+Math.random()*3;a.m=Math.random()<.6;a.vx=(Math.random()-.5)*24;a.vy=(Math.random()-.5)*16;if(a.vx)a.fl=a.vx<0}
 if(a.m){a.x=cl(a.x+a.vx*dt,23*16+8,35*16);a.y=cl(a.y+a.vy*dt,7*16+12,14*16+12)}}
/* ---------- loop ---------- */
function update(dt){now+=dt;for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=90*dt;p.l-=dt}parts=parts.filter(p=>p.l>0);for(const f of floats)f.t+=dt;floats=floats.filter(f=>f.t<1.3);
 shake=Math.max(0,shake-dt*2);flash=Math.max(0,flash-dt*2);if(P.act>0)P.act-=dt;
 const wx=S.wx;if(/rain|storm|snow/.test(wx)){const n=wx=='snow'?70:140;while(drops.length<n)drops.push({x:Math.random()*VW,y:Math.random()*VH,s:1+(Math.random()*2|0)});for(const d of drops){if(wx=='snow'){d.y+=18*dt*d.s;d.x+=Math.sin(now+d.y*.05)*6*dt}else{d.y+=220*dt;d.x-=40*dt}if(d.y>VH){d.y=-4;d.x=Math.random()*(VW+40)}}}else drops.length=0;
 if(AC&&RG)RG.gain.value=mode=='play'&&/rain|storm/.test(wx)?.05:0;
 if(mode=='title'){P.x=200+Math.sin(now*.08)*180+300;P.y=300+Math.cos(now*.05)*100;return}
 if(mode!='play'||panelOn)return;
 if(wx=='storm'){thT-=dt;if(thT<=0){thT=6+Math.random()*10;flash=.8;shake=.5;setTimeout(()=>sfx('thunder'),200)}}
 tickT+=dt;if(tickT>=TICK){tickT-=TICK;S.time+=10;S.abs+=10;hud();if(S.time==1320)toast('🌙 It\'s getting late. Head home to sleep.');if(S.time>=1560){const l=Math.min(500,Math.floor(S.gold*.1));S.gold-=l;sleep({l});return}
  if(isFest()&&S.time>=540&&S.time<1320&&P.x>37*16&&S.festSeen!=S.year+'-'+S.season){S.festSeen=S.year+'-'+S.season;S.st.fests++;toast('🎉 Welcome to the '+FESTS[S.season]+'!');chk()}}
 for(const n of npcs)updNpc(n,dt);for(const a of S.animals)updAnim(a,dt);
 if(fish){updFish(dt);return}
 let vx=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0)+joy.x,vy=(keys.ArrowDown||keys.KeyS?1:0)-(keys.ArrowUp||keys.KeyW?1:0)+joy.y;const m=Math.hypot(vx,vy);
 if(m>.15){vx/=Math.max(1,m);vy/=Math.max(1,m);const sp=(S.energy<=0?40:66)*dt;P.dir=Math.abs(vx)>Math.abs(vy)?(vx<0?2:3):(vy<0?1:0);
  const box=(x,y)=>solid(x-4,y-4)||solid(x+4,y-4)||solid(x-4,y)||solid(x+4,y);const nx=P.x+vx*sp;if(!box(nx,P.y))P.x=nx;const ny=P.y+vy*sp;if(!box(P.x,ny))P.y=ny;P.ft+=dt*9;P.fr=(P.ft|0)%4}else{P.fr=0;P.ft=0}
 promptT-=dt;if(promptT<=0){promptT=.12;const[tx,ty]=faceTile(),t=target(tx,ty);$('prompt').textContent=t?(isTouch?'':'␣ ')+t.l:'';$('prompt').style.opacity=t?1:0;$('bAct').textContent=t?t.e:'✋'}}
let lt=0;function loop(t){const dt=Math.min(.05,(t-lt)/1000||0);lt=t;if(S){update(dt);renderGround();render()}requestAnimationFrame(loop)}
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);const w=innerWidth,h=innerHeight;SC=cl(Math.floor(Math.min(w/300,h/190)),2,6);VW=Math.ceil(w/SC);VH=Math.ceil(h/SC);cv.width=VW;cv.height=VH;cv.style.width=VW*SC+'px';cv.style.height=VH*SC+'px';
 uc.width=w*DPR;uc.height=h*DPR;uc.style.width=w+'px';uc.style.height=h+'px';cx.imageSmoothingEnabled=false;drops.length=0}
/* ---------- input ---------- */
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT')return;keys[e.code]=1;if(mode!='play')return;audio();const c=e.code;
 if(c=='Space'||c=='KeyJ'||c=='Enter'){e.preventDefault();if(panelOn){if(c!='Space')return;return}if(!e.repeat){hold=true;act()}}
 else if(c=='Escape'||c=='KeyP'){panelOn?closeP():pauseP()}else if(c=='KeyE'||c=='KeyI'){panelOn?closeP():bag()}else if(c=='KeyQ'){panelOn?closeP():journal()}
 else if(c=='KeyM'){sfxOn=musOn=!(sfxOn||musOn);$('bSnd').textContent=sfxOn?'🔊':'🔇'}else if(/^Digit\d$/.test(c)&&!panelOn){A.sel((+c[5]+9)%10)}if(c.startsWith('Arrow'))e.preventDefault()});
addEventListener('keyup',e=>{keys[e.code]=0;if(e.code=='Space'||e.code=='KeyJ'||e.code=='Enter')hold=false});
addEventListener('blur',()=>{keys={};hold=false});
cv.addEventListener('wheel',e=>{if(mode=='play'&&!panelOn)A.sel((S.sel+(e.deltaY>0?1:9))%10)},{passive:true});
uc.addEventListener('pointerdown',e=>{if(mode!='play'||panelOn)return;audio();if(fish){hold=true;return fishPress()}const wx=e.clientX/SC+camX,wy=e.clientY/SC+camY,tx=wx>>4,ty=wy>>4,dx=tx*16+8-P.x,dy=ty*16+8-(P.y-6);
 if(Math.hypot(dx,dy)<30){P.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?2:3):(dy<0?1:0);act(tx,ty)}});
addEventListener('pointerup',()=>{hold=false});
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;audio();const f=A[b.dataset.a];if(f){f(b.dataset.v);if(b.dataset.a!='sel')sfx('sel')}});
$('pX').onclick=()=>closeP();$('panel').addEventListener('pointerdown',e=>{if(e.target.id=='panel')closeP()});
$('bBag').onclick=()=>{audio();panelOn?closeP():bag()};$('bJour').onclick=()=>{audio();panelOn?closeP():journal()};$('bPause').onclick=()=>{audio();panelOn?closeP():pauseP()};$('bSnd').onclick=()=>{audio();sfxOn=musOn=!(sfxOn||musOn);$('bSnd').textContent=sfxOn?'🔊':'🔇'};
(function touch(){const z=$('joy'),k=$('knob');let id=null,ox=0,oy=0;z.addEventListener('pointerdown',e=>{audio();id=e.pointerId;const r=z.getBoundingClientRect();ox=r.left+r.width/2;oy=r.top+r.height/2;z.setPointerCapture(id);mv(e)});
 const mv=e=>{if(e.pointerId!==id)return;let dx=e.clientX-ox,dy=e.clientY-oy;const m=Math.hypot(dx,dy),R=44;if(m>R){dx*=R/m;dy*=R/m}joy.x=dx/R;joy.y=dy/R;k.style.transform=`translate(${dx}px,${dy}px)`};
 z.addEventListener('pointermove',mv);const up=e=>{if(e.pointerId!==id)return;id=null;joy.x=joy.y=0;k.style.transform=''};z.addEventListener('pointerup',up);z.addEventListener('pointercancel',up);
 const b=$('bAct');b.addEventListener('pointerdown',e=>{e.preventDefault();audio();hold=true;act()});b.addEventListener('pointerup',()=>hold=false);b.addEventListener('pointerleave',()=>hold=false)})();
/* ---------- boot ---------- */
function startGame(s){S=s;mode='play';gKey='';closeP();npcs=NPCS.map(d=>({d,x:d.home[0]*16+8,y:d.home[1]*16+12,dir:0,fr:0,ft:0,vis:0}));npcs.forEach(n=>{placeNpc(n);n.x=n.tx;n.y=n.ty});
 if(!S.req)genReq();P.x=6*16;P.y=7*16+14;P.dir=0;$('title').classList.add('hide');['hud','tbtns','hotbar','hbwrap'].forEach(i=>$(i).classList.remove('hide'));document.body.classList.toggle('touch',isTouch);hud();hotbar();
 if(S.day==1&&S.season==0&&S.year==1&&S.time==360)setTimeout(()=>toast(isTouch?'📜 Tap the scroll to see your first quest!':'📜 Open your Journal (Q) to see your first quest!'),900)}
function toTitle(){mode='title';S=S||newState();['hud','tbtns','hotbar','hbwrap'].forEach(i=>$(i).classList.add('hide'));document.body.classList.remove('touch');$('title').classList.remove('hide');const s=load();
 $('tCont').classList.toggle('hide',!s);if(s)$('tCont').innerHTML=`▶ Continue <small>${SEASONS[s.season]} ${s.day}, Y${s.year} · ${fmt(s.gold)}g</small>`}
$('tNew').onclick=()=>{audio();const s=load();if(s&&!confirm('Start a new farm? Your saved farm will be replaced on the next save.'))return;startGame(newState(($('tName').value||'').trim().slice(0,14)||'Farmer'));save()};
$('tCont').onclick=()=>{audio();const s=load();if(s)startGame(s)};$('tHelp').onclick=()=>{audio();helpP()};
addEventListener('resize',resize);buildMap();resize();S=newState();toTitle();requestAnimationFrame(loop);
window.HH={get S(){return S},P,act,newDay,target,faceTile,sleep,get A(){return A},save,load};
