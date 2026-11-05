'use strict';
/* Harvest Hollow - content + pixel art (all original, drawn in code) */
const TILE=16,MW=64,MH=44,SEASON_DAYS=12,FEST_DAY=8;
const SEASONS=['Spring','Summer','Fall','Winter'];
const SCOL=[
 {g:'#6cb83c',g2:'#5ca233',g3:'#82cc52',fl:['#ff9cc2','#fff27a','#fff'],lf:'#3f9a3a',lf2:'#5cb84a',bl:'#ffb7d5'},
 {g:'#55a032',g2:'#468a2a',g3:'#68b440',fl:['#ffd23a','#ff7a5a','#9ad4ff'],lf:'#2f7d2f',lf2:'#43993a'},
 {g:'#b8923e',g2:'#a07a32',g3:'#c9a452',fl:['#e8602c','#f2b134'],lf:'#d0602a',lf2:'#e89a2c'},
 {g:'#e6edf5',g2:'#d0dbe8',g3:'#f6f9fc',fl:[],lf:'#e6edf5',lf2:'#ffffff'}];
const CROPS={
 turnip:{n:'Turnip',s:0,d:4,p:60,sp:20,sh:'root',c:'#f4ecf2',c2:'#b05ab0',l:'#5cb84a'},
 strawberry:{n:'Strawberry',s:0,d:6,r:3,p:110,sp:70,sh:'bush',c:'#e8344a',l:'#3f9a3a',fr:1},
 cauliflower:{n:'Cauliflower',s:0,d:8,p:190,sp:80,sh:'head',c:'#f5f0dc',c2:'#e0d8b8',l:'#4f9e4a'},
 tomato:{n:'Tomato',s:1,d:6,r:3,p:70,sp:45,sh:'vine',c:'#e8452c',l:'#3d8f35',fr:1},
 corn:{n:'Corn',s:1,d:8,r:4,p:65,sp:55,sh:'stalk',c:'#f5d23a',l:'#6cb33a'},
 melon:{n:'Melon',s:1,d:9,p:260,sp:85,sh:'head',c:'#7ac24a',c2:'#3e7a2a',l:'#3f8f35',fr:1},
 pumpkin:{n:'Pumpkin',s:2,d:9,p:320,sp:100,sh:'head',c:'#f08a24',c2:'#c86414',l:'#4b8a33'},
 eggplant:{n:'Eggplant',s:2,d:5,r:3,p:60,sp:25,sh:'vine',c:'#6b3a8f',l:'#3f8a3a'},
 cranberry:{n:'Cranberry',s:2,d:7,r:3,p:90,sp:65,sh:'bush',c:'#b3203a',l:'#5a7f2f',fr:1},
 leek:{n:'Frost Leek',s:3,d:5,p:110,sp:40,sh:'root',c:'#f0f5f0',c2:'#9fd8a0',l:'#4fae6a'},
 snowpea:{n:'Snow Pea',s:3,d:6,r:2,p:55,sp:35,sh:'vine',c:'#a5e07a',l:'#4a9e5a'},
 crystal:{n:'Crystal Berry',s:3,d:9,p:420,sp:150,sh:'bush',c:'#7fe3ff',l:'#3d8f80',fr:1}};
const FISH={
 bluegill:{n:'Bluegill',p:35,df:.3,loc:'pond',c:'#5a8fd0'},
 carp:{n:'Mud Carp',p:45,df:.25,loc:'pond',c:'#9a8a50'},
 koi:{n:'Golden Koi',p:350,df:.85,loc:'pond',c:'#ffb020',rare:.07},
 trout:{n:'River Trout',p:70,df:.45,loc:'river',c:'#d88aa0'},
 pike:{n:'Reed Pike',p:120,df:.6,loc:'river',c:'#6a9a50'},
 eel:{n:'Silver Eel',p:190,df:.7,loc:'river',c:'#c0c8d8'},
 moon:{n:'Moonfish',p:520,df:.92,loc:'river',c:'#dfe6ff',rare:.1,night:1},
 perch:{n:'Ice Perch',p:90,df:.5,loc:'any',c:'#90c8e0',sea:3}};
const ITEMS={hoe:{n:'Hoe',tool:1,d:'Till grass inside your field.'},can:{n:'Watering Can',tool:1,d:'Water soil. Refill at water.'},rod:{n:'Fishing Rod',tool:1,d:'Face water and cast.'},
 egg:{n:'Egg',p:50,e:15},milk:{n:'Milk',p:125,e:25},wool:{n:'Wool',p:220},
 cheese:{n:'Cheese',p:260,e:40,art:1},cloth:{n:'Cloth',p:480,art:1},hay:{n:'Hay',p:5,d:'Animal feed. Auto-fed from storage.'},
 pie:{n:'Festival Pie',p:60,e:100},
 m_press:{n:'Cheese Press',place:1,d:'Milk becomes Cheese (3h).'},m_loom:{n:'Loom',place:1,d:'Wool becomes Cloth (4h).'},m_jar:{n:'Preserves Jar',place:1,d:'Crops become Preserves (8h).'}};
const MACH={m_press:{i:'milk',o:'cheese',t:180},m_loom:{i:'wool',o:'cloth',t:240},m_jar:{i:'crop',t:480}};
const ANIM={chicken:{n:'Chicken',p:450,b:'coop',prod:'egg'},cow:{n:'Cow',p:1300,b:'barn',prod:'milk'},sheep:{n:'Sheep',p:1900,b:'barn',prod:'wool',every:2}};
const TOOL_COST=[500,1500,4000],TOOL_LV=['Basic','Copper','Silver','Gold'],TOOL_COL=['#9aa0a8','#d27a3a','#d8e0ea','#ffd23a'];
const BUILD={coop:[1500,3500],barn:[3000,5000],field:[1000,3000]};
const FIELDS=[[4,10,11,15],[4,10,15,18],[4,10,19,21]];
const NAMES=['Pebble','Clover','Biscuit','Maple','Nugget','Daisy','Mochi','Pippin','Hazel','Toffee','Bean','Juniper','Waffle','Sprout','Cocoa','Button'];
const NPCS=[
 {id:'bram',n:'Mayor Bram',role:'Mayor of Harvest Hollow',col:{sk:'#e8b48a',h:'#dcdcdc',sh:'#3a4f8f',pa:'#3a3040',hat:'#2c2a3a'},
  love:['cheese','c_pumpkin'],like:['c_cauliflower','milk','f_trout','p_pumpkin'],hate:['hay'],home:[47,8],
  sch:[[6,47,9],[9,56,19],[12,50,22],[16,56,19],[20,47,9]],fest:[50,21],
  l:[["Welcome to Harvest Hollow! That old farm has waited years for someone like you.","Ship your crops in the bin by your house. I'll make sure you're paid by morning.","Our festivals are on the 8th of every season. Don't miss them!"],
   ["You've brought real life back to that farm. The whole Hollow is talking.","When I was young I grew pumpkins the size of wagon wheels. Well... almost.","Thank you for helping out around town. It means a great deal."],
   ["I'd be proud to call you a friend of this town. Truly.","Some say the Golden Koi in your pond grants good harvests. Hah! Maybe it does.","Between us, I sneak cheese from the fair table every year."]]},
 {id:'june',n:'June',role:'Runs the General Store',col:{sk:'#f0c8a0',h:'#8a4a2a',sh:'#d0405a',pa:'#4a3a5a'},
  love:['c_strawberry','p_strawberry'],like:['egg','c_melon','cloth','c_crystal'],hate:['f_carp'],home:[41,8],
  sch:[[6,41,9],[8,43,18],[18,44,21],[20,41,9]],fest:[46,22],
  l:[["Hi! I'm June. Seeds are in the shop, and they change every season.","Morning is the best time to water. Well, any time is fine, honestly.","Need hay for your animals? I keep plenty in the back."],
   ["Your strawberries are the talk of the market! Keep 'em coming.","I've been saving up to expand the store. Maybe a little cafe corner?","You always look so busy. Remember to rest, okay?"],
   ["Honestly? You're my favorite customer. Don't tell the Mayor.","I painted the shop sign myself. Took three tries!","Whenever I smell rain I think of your farm now."]]},
 {id:'rowan',n:'Rowan',role:'Blacksmith & builder',col:{sk:'#c8865a',h:'#2a1a12',sh:'#6a5040',pa:'#2e2e36'},
  love:['c_corn','cheese'],like:['milk','f_pike','c_tomato'],hate:['c_snowpea'],home:[53,8],
  sch:[[6,53,9],[8,50,18],[19,52,22],[21,53,9]],fest:[53,24],
  l:[["Name's Rowan. Bring gold and I'll sharpen your tools or raise a barn.","Copper, silver, gold. Each upgrade makes your hoe and can hit more ground.","A good coop keeps chickens happy. Happy chickens, more eggs."],
   ["Your farm's coming along. I can see it from the forge roof.","Forge work is honest work. Like farming, I suppose.","Grilled corn after a long day of hammering... perfect."],
   ["You're alright. More than alright, really.","I'm building something special for the fair. It's a secret.","If you ever need a hand, my door's open."]]},
 {id:'nell',n:'Nell',role:'Fisher on the river',col:{sk:'#f2d0b0',h:'#e8c050',sh:'#3a8a8a',pa:'#3a4a6a',hat:'#d8a040'},
  love:['f_eel','f_moon'],like:['f_trout','f_koi','c_tomato','pie'],hate:['wool'],home:[59,8],
  sch:[[6,59,9],[8,46,36],[13,52,36],[18,46,36],[21,59,9]],fest:[48,26],
  l:[["Shh, you'll scare the trout. Oh, hi! Fishing? Wait for the bite, then reel!","Keep the fish inside the green bar. Patience is the whole trick.","The river has bigger fish than the pond. And at night... the Moonfish."],
   ["You've got a good wrist for casting. Someone taught you well. Oh, me!","A Silver Eel once pulled me right in. True story.","I love the sound of rain on the water."],
   ["Fishing with you is the best part of my week.","I'll tell you a secret spot someday. Maybe.","Cast, wait, breathe. That's how I live too."]]},
 {id:'pip',n:'Pip',role:'Young artist',col:{sk:'#f5d0b0',h:'#3a2a6a',sh:'#f0a020',pa:'#3a60a0'},
  love:['c_melon','c_crystal'],like:['egg','c_strawberry','pie','c_snowpea'],hate:['c_eggplant'],home:[42,9],
  sch:[[7,42,10],[9,47,25],[12,53,27],[15,44,27],[19,42,10]],fest:[51,27],
  l:[["Are you the new farmer?! Can I draw your chickens?","I'm drawing the whole town! You're in it now. You're kind of a stick.","Melons are the best fruit. That's a fact, not an opinion."],
   ["I drew your farm from the hill! It has a little heart on it.","Mom says I can visit your farm if I don't chase the chickens. I'll try.","Do cows dream? I think they dream about grass."],
   ["You're my best friend. Well, you and my crayons.","I made you a drawing. It's in my head, but it's very good.","When I grow up I want a farm exactly like yours!"]]},
 {id:'sage',n:'Sage',role:'Herbalist',col:{sk:'#d8a080',h:'#5a8a5a',sh:'#7a5aa0',pa:'#4a3a3a'},
  love:['c_cranberry','cloth'],like:['c_leek','c_turnip','wool','p_cranberry'],hate:['f_carp'],home:[41,33],
  sch:[[6,41,33],[9,42,35],[14,57,28],[18,41,33]],fest:[45,25],
  l:[["Welcome. I'm Sage. I brew remedies from what the Hollow grows.","Eat what you grow when you're tired. Your body will thank you.","Winter has its own crops. Frost Leeks are wonderful for colds."],
   ["Your soil has a good spirit. I can tell from your turnips.","I wove this scarf from local wool. Warm, isn't it?","The storms here are fierce, but they keep the river full."],
   ["Your visits bring me calm. Thank you.","I planted a little herb garden because of you.","You carry sunlight with you. I mean that."]]}];
const QUESTS=[
 ['First Furrows','Till soil with the Hoe and plant 5 seeds.','planted',5,100],
 ['Fresh From the Soil','Water daily and harvest 5 crops.','harvested',5,150],
 ['Open for Business','Earn 500g from the shipping bin.','shipped',500,200],
 ['Neighborly','Say hello to all 6 villagers.','met',6,250],
 ['Gone Fishing','Catch 3 fish at the pond or river.','fish',3,200],
 ['Feathered Friends','Build a coop at the forge and buy a chicken.','chickens',1,300],
 ['Small Batch','Make an artisan good in a machine.','artisan',1,300],
 ['Sharpened Up','Upgrade a tool at the forge.','upgrades',1,400],
 ['Big Barn Energy','Build a barn and buy a cow or sheep.','big',1,500],
 ['Kindred Spirits','Reach 4 hearts with a villager.','maxHeart',4,600],
 ['Festival Goer','Attend a seasonal festival.','fests',1,400],
 ['Pride of the Hollow','Earn 20,000g in total.','shipped',20000,2000]];
const ACH=[
 ['First Sprout','Harvest your first crop','harvested',1],['Green Thumb','Harvest 100 crops','harvested',100],
 ['Seed Collector','Harvest all 12 crop types','kinds',12],['Small Business','Ship 1,000g of goods','shipped',1000],
 ['Market Mogul','Ship 10,000g of goods','shipped',10000],['Angler','Catch 10 fish','fish',10],
 ['Legend of the Water','Catch a Golden Koi or Moonfish','legend',1],['Rancher','Own 5 animals','animals',5],
 ['Full Menagerie','Own a chicken, a cow and a sheep','types',3],['Artisan','Make 10 artisan goods','artisan',10],
 ['Golden Touch','Upgrade a tool to Gold','goldTool',1],['Best Friends','Reach 8 hearts with a villager','maxHeart',8],
 ['Social Butterfly','Reach 3 hearts with everyone','minHeart',3],['Fair Champion','Win a festival contest','champ',1],
 ['Weathered','Live through a storm','storms',1],['Full Circle','Complete a whole year','years',1],
 ['Wide Acres','Fully expand your field','field',2],['Helping Hand','Finish 5 bulletin requests','board',5]];
const FESTS=['Blossom Fair','Lantern Night','Harvest Fair','Frost Festival'];
const MUSIC=[
 {bpm:112,root:60,sc:[0,2,4,7,9],prog:[0,5,3,4],w:'square',seed:11},
 {bpm:124,root:62,sc:[0,2,4,5,7,9,11],prog:[0,3,4,0],w:'square',seed:23},
 {bpm:96,root:57,sc:[0,2,3,5,7,8,10],prog:[0,5,3,4],w:'triangle',seed:37},
 {bpm:84,root:64,sc:[0,2,3,7,9],prog:[0,3,5,4],w:'triangle',seed:51}];
function rngF(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function itemInfo(id){
 if(ITEMS[id])return ITEMS[id];const k=id.slice(2),pre=id[0];
 if(pre=='s'){const c=CROPS[k];return{n:c.n+' Seeds',seed:k,p:c.sp>>1,d:SEASONS[c.s]+' crop. '+c.d+' days'+(c.r?', regrows every '+c.r:'')+'.'}}
 if(pre=='c'){const c=CROPS[k];return{n:c.n,crop:k,p:c.p,e:Math.min(60,10+(c.p/8|0))}}
 if(pre=='p'){const c=CROPS[k];return{n:c.n+(c.fr?' Jam':' Pickles'),p:c.p*2+50,e:30,art:1}}
 if(pre=='f'){const f=FISH[k];return{n:f.n,p:f.p,e:20,fish:k}}
 return{n:id,p:0}}
/* ---------- pixel art ---------- */
function R(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x|0,y|0,w,h)}
function drawPerson(c,x,y,dir,fr,o,tool){
 x=Math.round(x-5);y=Math.round(y-17);const b=fr%2,lo=fr==1?1:fr==3?-1:0;
 R(c,x+1,y+16,8,2,'rgba(0,0,0,.22)');
 R(c,x+2,y+12,2,lo>0?3:4,o.pa);R(c,x+6,y+12,2,lo<0?3:4,o.pa);
 R(c,x+2,y+15+(lo>0?-1:0),2,1,'#3a2418');R(c,x+6,y+15+(lo<0?-1:0),2,1,'#3a2418');
 R(c,x+1,y+7-b,8,6,o.sh);R(c,x+1,y+12-b,8,1,'rgba(0,0,0,.2)');
 if(dir<2){R(c,x,y+8-b,1,4,o.sk);R(c,x+9,y+8-b,1,4,o.sk)}else R(c,x+(dir==2?3:6),y+8-b,1,4,o.sk);
 R(c,x+1,y-b,8,7,o.sk);
 if(dir==1)R(c,x+1,y-b,8,6,o.h);else{R(c,x+1,y-b,8,2,o.h);R(c,x+1,y-b,1,4,o.h);R(c,x+8,y-b,1,4,o.h);
  if(dir==2)R(c,x+5,y-b,4,4,o.h);if(dir==3)R(c,x+1,y-b,4,4,o.h)}
 const e='#2a1a1a';
 if(dir==0){R(c,x+3,y+3-b,1,2,e);R(c,x+6,y+3-b,1,2,e);R(c,x+2,y+5-b,1,1,'#f09090');R(c,x+7,y+5-b,1,1,'#f09090')}
 if(dir==2)R(c,x+2,y+3-b,1,2,e);if(dir==3)R(c,x+7,y+3-b,1,2,e);
 if(o.hat){R(c,x-1,y-1-b,12,2,o.hat);R(c,x+2,y-3-b,6,2,o.hat)}
 if(tool&&dir!=1){const tx=dir==2?x-3:dir==3?x+10:x+8;R(c,tx,y+6-b,2,6,'#8a5a30')}}
function drawChicken(c,x,y,fr,col){x=Math.round(x-4);y=Math.round(y-8);const b=fr%2;
 R(c,x,y+7,8,1,'rgba(0,0,0,.2)');R(c,x+1,y+2+b,6,5,col||'#fafafa');R(c,x+5,y+b,3,3,col||'#fafafa');R(c,x+6,y-1+b,1,1,'#e03030');
 R(c,x+8,y+1+b,1,1,'#f0a020');R(c,x+6,y+1+b,1,1,'#222');R(c,x,y+3+b,2,2,'#ddd');R(c,x+3,y+7,1,1,'#f0a020');R(c,x+5,y+7,1,1,'#f0a020')}
function drawCow(c,x,y,fr,flip){x=Math.round(x-8);y=Math.round(y-12);const b=fr%2;c.save();if(flip){c.translate(x*2+16,0);c.scale(-1,1)}
 R(c,x,y+11,16,1,'rgba(0,0,0,.2)');R(c,x+1,y+3,12,6,'#f4f0e8');R(c,x+3,y+4,4,3,'#4a3a32');R(c,x+9,y+6,3,2,'#4a3a32');
 R(c,x+2,y+9,2,2+b,'#e8e0d4');R(c,x+10,y+9,2,3-b,'#e8e0d4');R(c,x+12,y+1,4,5,'#f4f0e8');R(c,x+13,y+4,3,2,'#f0a0a0');
 R(c,x+14,y+2,1,1,'#222');R(c,x+12,y,1,1,'#d8c8a0');R(c,x+15,y,1,1,'#d8c8a0');R(c,x,y+3,1,4,'#4a3a32');c.restore()}
function drawSheep(c,x,y,fr,flip,shorn){x=Math.round(x-7);y=Math.round(y-11);const b=fr%2;c.save();if(flip){c.translate(x*2+14,0);c.scale(-1,1)}
 R(c,x,y+10,14,1,'rgba(0,0,0,.2)');const w=shorn?'#e8e0d0':'#fbfbf4';
 R(c,x+1,y+2,10,7,w);R(c,x,y+3,12,5,w);if(!shorn){R(c,x+2,y+1,3,2,w);R(c,x+6,y+1,3,2,w)}
 R(c,x+2,y+9,2,2-b,'#3a3030');R(c,x+8,y+9,2,1+b,'#3a3030');R(c,x+10,y+2,4,5,'#3a3030');R(c,x+12,y+3,1,1,'#fff');c.restore()}
function drawCrop(c,x,y,cr,st,dead){x=x|0;y=y|0;const L=dead?'#8a7a50':cr.l,F=cr.c;
 if(st==0){R(c,x+5,y+9,2,2,'#5a3a20');R(c,x+9,y+10,2,2,'#5a3a20');R(c,x+7,y+8,1,2,dead?L:'#7acc50');return}
 if(st==1){R(c,x+7,y+7,2,5,L);R(c,x+5,y+7,2,2,L);R(c,x+9,y+6,2,2,L);return}
 const sh=cr.sh;
 if(sh=='root'){const h=st+2;R(c,x+7,y+12-h*2,2,h*2,L);R(c,x+4,y+11-h*2,3,h,L);R(c,x+9,y+10-h*2,3,h,L);R(c,x+5,y+12-h,6,2,L);
  if(st>=3){R(c,x+5,y+11,6,st==4?4:2,F);if(cr.c2)R(c,x+5,y+11,6,1,cr.c2)}}
 else if(sh=='bush'){const w=st==2?8:12,h=st==2?5:8;R(c,x+8-w/2,y+13-h,w,h,L);R(c,x+9-w/2,y+12-h,w-2,1,L);R(c,x+9-w/2,y+12-h+2,2,2,'rgba(255,255,255,.18)');
  if(st==3){R(c,x+5,y+7,1,1,'#fff');R(c,x+10,y+9,1,1,'#fff')}if(st==4){[[4,7],[8,6],[11,9],[6,10],[9,11]].forEach(p=>R(c,x+p[0],y+p[1],2,2,F))}}
 else if(sh=='vine'){if(st>=2)R(c,x+7,y+1,1,12,'#9a6a3a');const h=st==2?6:11;
  for(let i=0;i<h;i+=3){R(c,x+4,y+12-i,3,2,L);R(c,x+8,y+11-i,3,2,L)}
  if(st==4){if(cr.n=='Eggplant'){R(c,x+3,y+6,3,5,F);R(c,x+9,y+4,3,5,F)}else if(cr.n=='Snow Pea'){R(c,x+3,y+5,2,4,F);R(c,x+10,y+7,2,4,F);R(c,x+4,y+10,2,3,F)}
   else{R(c,x+3,y+6,3,3,F);R(c,x+10,y+4,3,3,F);R(c,x+9,y+9,3,3,F)}}}
 else if(sh=='stalk'){const h=st==2?7:st==3?12:14;R(c,x+7,y+14-h,2,h,L);R(c,x+3,y+10-h/3,4,1,L);R(c,x+9,y+12-h/2,4,1,L);R(c,x+4,y+12,3,1,L);
  if(st==4){R(c,x+9,y+4,2,5,F);R(c,x+9,y+4,2,1,'#8ac040');R(c,x+7,y,2,2,'#e0c070')}}
 else{if(st==2){R(c,x+3,y+10,4,3,L);R(c,x+9,y+9,4,3,L);R(c,x+6,y+8,4,3,L)}
  else{R(c,x+1,y+10,5,3,L);R(c,x+10,y+10,5,3,L);R(c,x+4,y+6,3,3,L);R(c,x+9,y+6,3,3,L);
   if(st==3)R(c,x+6,y+9,4,4,'#6aa040');else{R(c,x+3,y+6,10,8,F);R(c,x+4,y+5,8,1,F);if(cr.c2){R(c,x+6,y+6,1,8,cr.c2);R(c,x+9,y+6,1,8,cr.c2)}R(c,x+4,y+7,2,2,'rgba(255,255,255,.35)');if(cr.n=='Pumpkin')R(c,x+7,y+3,2,3,'#5a7a2a')}}}}
function drawItem(c,id,x,y){const I=itemInfo(id);x|=0;y|=0;
 if(I.seed){const cr=CROPS[I.seed];R(c,x+3,y+2,10,12,'#e8d4a0');R(c,x+3,y+2,10,2,'#c8a870');R(c,x+5,y+6,6,5,cr.c);R(c,x+7,y+5,2,1,cr.l);R(c,x+3,y+13,10,1,'#b89860');return}
 if(I.crop){const cr=CROPS[I.crop],F=cr.c;
  if(cr.sh=='root'){R(c,x+4,y+7,8,7,F);R(c,x+5,y+14,6,1,F);if(cr.c2)R(c,x+4,y+7,8,2,cr.c2);R(c,x+6,y+2,1,5,cr.l);R(c,x+9,y+2,1,5,cr.l);R(c,x+5,y+9,2,2,'rgba(255,255,255,.4)')}
  else if(cr.sh=='bush'){[[4,6],[8,5],[6,9],[10,9],[3,10]].forEach(p=>R(c,x+p[0],y+p[1],4,4,F));R(c,x+7,y+3,3,2,cr.l);R(c,x+5,y+7,1,1,'#fff')}
  else if(cr.sh=='stalk'){R(c,x+6,y+2,4,12,F);for(let i=0;i<5;i++)R(c,x+7,y+3+i*2,1,1,'#d8a820');R(c,x+4,y+8,2,7,cr.l);R(c,x+10,y+8,2,7,cr.l)}
  else if(cr.n=='Eggplant'){R(c,x+5,y+5,6,9,F);R(c,x+4,y+7,8,5,F);R(c,x+6,y+3,4,2,cr.l);R(c,x+6,y+7,1,3,'rgba(255,255,255,.3)')}
  else if(cr.n=='Snow Pea'){R(c,x+3,y+7,10,4,F);R(c,x+4,y+6,8,1,F);[5,8,11].forEach(i=>R(c,x+i-1,y+8,2,2,'#7ab850'))}
  else{R(c,x+3,y+4,10,10,F);R(c,x+2,y+6,12,6,F);if(cr.c2){R(c,x+6,y+4,1,10,cr.c2);R(c,x+9,y+4,1,10,cr.c2)}R(c,x+7,y+2,2,3,cr.l);R(c,x+4,y+6,2,2,'rgba(255,255,255,.4)')}return}
 if(I.fish){const f=FISH[I.fish];R(c,x+2,y+6,10,5,f.c);R(c,x+4,y+5,6,7,f.c);R(c,x+12,y+5,3,7,f.c);R(c,x+4,y+7,1,1,'#222');R(c,x+5,y+9,5,1,'rgba(255,255,255,.4)');return}
 if(id[0]=='p'){const cr=CROPS[id.slice(2)];R(c,x+4,y+4,8,10,'#cfe8f0');R(c,x+5,y+6,6,7,cr.c);R(c,x+3,y+2,10,2,'#b0703a');R(c,x+5,y+7,2,3,'rgba(255,255,255,.5)');return}
 const T={egg:()=>{R(c,x+5,y+4,6,9,'#fff6e0');R(c,x+4,y+6,8,6,'#fff6e0');R(c,x+6,y+6,2,2,'#fff')},
  milk:()=>{R(c,x+5,y+5,6,9,'#fafafa');R(c,x+6,y+2,4,3,'#e0e0e0');R(c,x+6,y+1,4,1,'#3a6ad0');R(c,x+5,y+8,6,2,'#3a6ad0')},
  wool:()=>{[[3,6],[7,4],[9,8],[4,9],[7,9]].forEach(p=>R(c,x+p[0],y+p[1],5,5,'#f8f8f0'));R(c,x+5,y+8,2,2,'#e0e0d0')},
  cheese:()=>{R(c,x+2,y+7,12,6,'#f8d050');R(c,x+5,y+4,9,3,'#f8d050');R(c,x+5,y+9,2,2,'#d8a830');R(c,x+10,y+8,2,2,'#d8a830')},
  cloth:()=>{R(c,x+2,y+5,12,7,'#c86a8a');R(c,x+2,y+5,12,1,'#e090b0');R(c,x+12,y+5,2,9,'#a04a6a');R(c,x+4,y+8,8,1,'#e8a0c0')},
  hay:()=>{R(c,x+3,y+5,10,9,'#e8c860');R(c,x+3,y+9,10,1,'#a07830');for(let i=0;i<5;i++)R(c,x+4+i*2,y+3,1,3,'#f0d878')},
  pie:()=>{R(c,x+2,y+8,12,5,'#d89048');R(c,x+3,y+6,10,2,'#e8b060');R(c,x+5,y+7,2,1,'#a03030');R(c,x+9,y+7,2,1,'#a03030')},
  hoe:()=>{R(c,x+7,y+3,2,12,'#8a5a30');R(c,x+3,y+2,7,3,TOOL_COL[S.tools.hoe])},
  can:()=>{R(c,x+3,y+6,9,7,TOOL_COL[S.tools.can]);R(c,x+12,y+5,3,2,TOOL_COL[S.tools.can]);R(c,x+5,y+3,5,1,'#555');R(c,x+4,y+8,7,2,'rgba(0,0,0,.15)')},
  rod:()=>{for(let i=0;i<12;i++)R(c,x+3+i,y+13-i,1,1,'#8a5a30');R(c,x+14,y+2,1,10,'#ddd');R(c,x+4,y+11,3,3,TOOL_COL[S.tools.rod])}};
 if(T[id])return T[id]();if(I.place)drawMachine(c,id,x,y+16,0)}
function drawMachine(c,id,x,y,on){y-=16;
 if(id=='m_press'){R(c,x+2,y+4,12,11,'#8a6a4a');R(c,x+2,y+4,12,2,'#a8886a');R(c,x+6,y,4,4,'#555');R(c,x+5,y+8,6,4,on?'#f8d050':'#5a4030')}
 else if(id=='m_loom'){R(c,x+2,y+2,2,13,'#7a5030');R(c,x+12,y+2,2,13,'#7a5030');R(c,x+2,y+2,12,2,'#9a6a40');R(c,x+4,y+5,8,7,on?'#c86a8a':'#d8d0c0');for(let i=0;i<4;i++)R(c,x+5+i*2,y+5,1,7,'rgba(0,0,0,.15)');R(c,x+2,y+12,12,2,'#9a6a40')}
 else{R(c,x+3,y+4,10,11,'#cfe8f0');R(c,x+4,y+6,8,8,on?'#e8445a':'#a8c8d0');R(c,x+2,y+2,12,3,'#b0703a');R(c,x+5,y+7,2,4,'rgba(255,255,255,.5)')}}
