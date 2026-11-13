const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
process.chdir(path.join(__dirname,'..'));global.window=global;
vm.runInThisContext(fs.readFileSync('stealth.js','utf8'));
const s=SanityStealth;
const enemy=(x=0,y=0,angle=0)=>({x,y,r:13,angle,type:'grunt',state:'IDLE',phase:0,stun:0});
const wall={x:45,y:-80,w:12,h:160},p={x:100,y:0,r:12};
let e=enemy();assert.ok(s.canSee(e,p,[],[]));s.perceive(e,p,.016,[],[]);assert.equal(e.state,'COMBAT');
e=enemy(0,0,Math.PI);s.perceive(e,p,.016,[],[]);assert.equal(e.state,'IDLE');
e=enemy();s.perceive(e,p,.016,[wall],[]);assert.equal(e.state,'IDLE');
const door=()=>({type:'passage',axis:'vertical',x:38,y:-48,w:24,h:96});
let d=door();s.setup([d]);assert.ok(!s.canSee(enemy(),p,[],[d]));
assert.ok(s.blocked(50,0,12,[d]));
for(const side of [-1,1]){
 d=door();s.setup([d]);const actor={x:50+side*22,y:0,r:12};
 assert.ok(s.open(d,actor,[],[d]));
 s.updateDoors([d],1,[actor],[],[],()=>{});
 assert.equal(d.progress,1);assert.ok(!s.blocked(50,0,12,[d]));
 assert.ok(s.leaves(d).every(leaf=>(leaf.b.x-50)*side<0),'Swings away');
}
d=door();s.setup([d]);e=enemy(74,-20);
s.open(d,{x:24,y:0},[],[d]);let impacts=0;
s.updateDoors([d],1,[e],[e],[],()=>impacts++);
assert.equal(impacts,1);assert.ok(e.stun>=.85);assert.equal(d.progress,1);
const rr=[{id:0,x:0,y:0,w:180,h:180},{id:1,x:200,y:0,w:180,h:180},{id:2,x:900,y:0,w:180,h:180}];
const con=[{id:0,a:0,b:1}];
d=door();d.connection=0;s.setup([d]);
e=enemy(260,90);const isolated=enemy(940,90),origin={x:80,y:90};
s.noise(origin,[e,isolated],rr,con,[d],1250);
assert.equal(e.state,'ALERTED');assert.equal(isolated.state,'IDLE');
assert.notEqual(e.lastKnown,origin);
const memory={...e.lastKnown};s.perceive(e,{x:1500,y:1000},.1,[wall],[d]);
assert.deepEqual(e.lastKnown,memory);assert.equal(e.state,'SEARCHING');
s.perceive(e,{x:1500,y:1000},10,[wall],[d]);assert.equal(e.state,'IDLE');
e=enemy(0,0,Math.PI);d=door();s.setup([d]);s.open(d,{x:20,y:0},[],[d]);
s.perceive(e,p,.01,[],[d]);assert.equal(e.state,'IDLE');
// A leaf must stop rather than crush an actor against a wall.
d=door();s.setup([d]);e=enemy(74,-20);
s.open(d,{x:20,y:0},[],[d]);const trap={x:88,y:-60,w:30,h:100};
s.updateDoors([d],1/60,[e],[e],[trap],()=>{});
assert.ok(d.progress<1);assert.ok(!s.blocked(e.x,e.y,e.r,[d]));
for(let frame=0;frame<60;frame++)s.updateDoors([d],1/60,[e],[e],[trap],()=>{});
assert.equal(d.progress,1);assert.ok(d.sliding);assert.ok(!s.blocked(e.x,e.y,e.r,[d]));
console.log('PASS: FOV, occlusion, both opening directions, collision, stun, sound routing, memory and trapping');

// Execute the real game closure with rendering/DOM adapters, without changing production exports.
class Element{
 constructor(){this.style={};this.dataset={};this.children=[];this.clientWidth=1280;this.clientHeight=800;
 const classes=new Set();this.classList={add:(...items)=>items.forEach(i=>classes.add(i)),remove:(...items)=>items.forEach(i=>classes.delete(i)),toggle(){},contains:i=>classes.has(i)};}
 set innerHTML(value){this.children=[];}
 getContext(){return new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});}
 addEventListener(){}getBoundingClientRect(){return {left:0,top:0,width:1280,height:800}}
 scrollIntoView(){}
 appendChild(e){this.children.push(e)}querySelectorAll(){return this.children}
 append(...items){this.children.push(...items)}
 click(){if(!this.disabled)this.onclick?.()}
}
const elements=new Map(),document={querySelector:k=>{if(!elements.has(k))elements.set(k,new Element());return elements.get(k)},createElement:()=>new Element()};
let seed=0x53414e49;const seededMath=Object.create(Math);
seededMath.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const inputEvents={};
const sandbox={window:null,document,devicePixelRatio:1,addEventListener:(type,fn)=>{inputEvents[type]=fn},requestAnimationFrame(){},setTimeout(){},
 Image:class{set src(v){this.naturalWidth=224;this.naturalHeight=224;this.onload()}},
 SanityStealth:s,SanityQuizEyes:{hide(){},show(){},react(){}},SanityAIDialogue:{clear(){},react(){}},SanityMalwareCounter:{reset(){},update(){}},console,Math:seededMath};
sandbox.window=sandbox;
const context=vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('map-corporate.js','utf8'),context);
vm.runInContext(fs.readFileSync('map-layouts.js','utf8'),context);
vm.runInContext(fs.readFileSync('office-renderer.js','utf8'),context);
vm.runInContext(fs.readFileSync('questions.js','utf8'),context);
vm.runInContext(fs.readFileSync('buffs.js','utf8'),context);
let source=fs.readFileSync('game.js','utf8');
const end=source.lastIndexOf('})();');
source=source.slice(0,end)+`
window.testGame={
 generate(f){floor=f;player={};startFloor();return {rooms,walls,doors,enemies,connections,player,nav,currentMap};},
 collides,move,nearestCell,shoot,update,draw,
 getState(){return {floor,paused,quizStreak,rewardPending,upgradeChosen,currentQuestion};},
 clearEnemies(){enemies=[];},
 setPlayer(pos){Object.assign(player,pos);},getPlayer(){return player;}
};
`+source.slice(end);
vm.runInContext(source,context);
const g=sandbox.testGame;
let maps=0,doorCount=0;
for(const sectorFloor of [1,2,3,6,11]){
 for(let n=0;n<20;n++){
 const data=g.generate(sectorFloor),{nav,rooms,doors,player,enemies}=data;
 assert.ok(rooms.length>=9);assert.ok(doors.filter(d=>d.type==='passage').length>=rooms.length-1);
 assert.equal(data.currentMap.id,sandbox.SanityMapLayouts.forFloor(sectorFloor));
 assert.ok(enemies.every(e=>e.state==='IDLE'&&!e.alert));
 assert.ok(!g.collides(player.x,player.y,player.r));
 const first=g.nearestCell(player.x,player.y),seen=new Set([first]),queue=[first];
 for(let head=0;head<queue.length;head++){
 const i=queue[head],x=i%nav.cols,y=(i/nav.cols)|0;
 for(const k of [x>0?i-1:-1,x<nav.cols-1?i+1:-1,y>0?i-nav.cols:-1,y<nav.rows-1?i+nav.cols:-1])
 if(k>=0&&nav.walk[k]&&!seen.has(k)){seen.add(k);queue.push(k);}
 }
 for(const r of rooms)assert.ok(seen.has(g.nearestCell(r.x+r.w/2,r.y+r.h/2)), 'Isolated room '+r.id+' sector '+sectorFloor);
 for(const d of doors.filter(d=>d.type==='passage')){
 assert.ok(!data.walls.some(w=>d.cx>w.x&&d.cx<w.x+w.w&&d.cy>w.y&&d.cy<w.y+w.h),'Door in wall');
 const actor={x:d.cx+(d.axis==='vertical'?-24:0),y:d.cy+(d.axis==='horizontal'?-24:0),r:12};
 s.open(d,actor,data.walls,doors);s.updateDoors(doors,1,[],[],data.walls,()=>{});
 assert.equal(d.progress,1);
 assert.ok(!s.blocked(d.cx,d.cy,12,[d]),'Open doorway blocked');
 doorCount++;
 }
 maps++;
 }
}
// Actual high-speed movement must not tunnel through a closed door.
const data=g.generate(1),gate=data.doors.find(d=>d.type==='passage'&&d.axis==='vertical');
const actor={x:gate.cx-25,y:gate.cy,r:12};
g.move(actor,80,0);assert.ok(actor.x<gate.cx,'Closed door traversal');
s.open(gate,actor,data.walls,data.doors);s.updateDoors(data.doors,1,[],[],data.walls,()=>{});
g.move(actor,55,0);assert.ok(actor.x>gate.cx,'Open door traversal');
console.log('PASS: '+maps+' real procedural maps, '+doorCount+' doors, all sectors, room reachability and movement');
// Exercise the full update and shoot hooks, not only the perception module.
const real=g.generate(1);const guard=real.enemies[0];
real.walls.splice(0);real.doors.splice(0);real.connections.splice(0);
real.rooms.splice(0,real.rooms.length,{id:0,x:0,y:0,w:1740,h:1120});
real.enemies.splice(1);Object.assign(guard,{x:600,y:500,angle:Math.PI,state:'IDLE',lastKnown:null,alert:false});
g.setPlayer({x:720,y:500,angle:0});g.update(.016);
assert.equal(guard.state,'IDLE');assert.equal(guard.x,600);
guard.angle=0;g.update(.016);assert.equal(guard.state,'COMBAT');
real.walls.push({x:650,y:400,w:24,h:200});
g.update(.016);assert.equal(guard.state,'SEARCHING');
Object.assign(guard,{state:'IDLE',visible:false,memory:0,lastKnown:null});
g.shoot();assert.ok(['ALERTED','SUSPICIOUS'].includes(guard.state));
assert.ok(guard.lastKnown.x>680);
console.log('PASS: real update loop stealth/visual detection and actual shotgun sound hook');
const officeSignatures=new Set();
for(const floor of [1,2,3,4,5,6,8,10,11,12,14,15,16,17,18,19,20,21,25,26,27,30,31,32,33,34,35]){
 const data=g.generate(floor),map=data.currentMap;
 assert.equal(map.id,sandbox.SanityMapLayouts.forFloor(floor));
 officeSignatures.add(map.signature);
 assert.equal(data.enemies.length,Math.min(18,4+Math.floor((floor-1)/2)),'Enemy count floor '+floor);
 assert.ok(data.enemies.every(e=>!g.collides(e.x,e.y,e.r)&&map.reachable[g.nearestCell(e.x,e.y)]),'Invalid guard spawn');
 assert.ok(map.props.filter(p=>p.solid).every(p=>g.collides(p.x+p.w/2,p.y+p.h/2,4,false)),'Furniture collision');
 for(const door of data.doors.filter(d=>d.type==='passage')){
   const actor={x:door.cx-30,y:door.cy-30,r:12};
   s.open(door,actor,data.walls,data.doors);
 }
 s.updateDoors(data.doors,1,[],[],data.walls,()=>{});
 const walk=data.nav.walk.slice();
 for(let i=0;i<walk.length;i++)if(walk[i]&&s.blocked((i%data.nav.cols+.5)*15,(Math.floor(i/data.nav.cols)+.5)*15,18,data.doors))walk[i]=0;
 const physical={...data.nav,walk},reachable=sandbox.SanityOffice.reachable(physical,g.nearestCell(data.player.x,data.player.y));
 for(const r of data.rooms)assert.ok(reachable[g.nearestCell(r.x+r.w/2,r.y+r.h/2)],'Open-door traversal: '+floor+' room '+r.id);
 const exit=data.doors.find(d=>d.type==='elevator');
 assert.ok(reachable[g.nearestCell(exit.x,exit.y)],'Elevator unreachable');
 g.draw();
}
assert.equal(officeSignatures.size,27);
// Reproduce the reported bug via E while pressed against actual map door leaves.
let interactions=0;
for(const floor of [1,2,3,6]){
const doorFloor=g.generate(floor);g.clearEnemies();
for(const gate of doorFloor.doors.filter(d=>d.type==='passage')){
 for(const side of [-1,1])for(const offset of [-30,30]){
  s.setup([gate]);
  g.setPlayer({x:gate.cx+(gate.axis==='vertical'?side*15.01:offset),
    y:gate.cy+(gate.axis==='vertical'?offset:side*15.01)});
  assert.ok(!g.collides(g.getPlayer().x,g.getPlayer().y,12),'Invalid door approach');
  inputEvents.keydown({key:'e',repeat:false,preventDefault(){}});
  inputEvents.keyup({key:'e'});
  assert.ok(gate.opening,'E did not select the door');
  for(let frame=0;frame<60;frame++)g.update(1/144);
  assert.equal(gate.progress,1,'E opening stalled against player');
  g.move(g.getPlayer(),gate.axis==='vertical'?-side*50:0,gate.axis==='horizontal'?-side*50:0);
  const position=gate.axis==='vertical'?g.getPlayer().x-gate.cx:g.getPlayer().y-gate.cy;
  assert.ok(position*side<0,'Player could not cross opened door');
  interactions++;
 }
}
}
console.log('PASS: '+interactions+' real E interactions and door crossings from both sides near hinges');
// Drive the actual E and continue handlers at the elevator, with the real Quiz/buff catalogs.
let officeFloor=g.generate(5);
const lift=officeFloor.doors.find(d=>d.type==='elevator');
g.setPlayer({x:lift.x,y:lift.y});
inputEvents.keydown({key:'e',repeat:false,preventDefault(){}});
assert.equal(g.getState().paused,false,'Elevator bypassed active enemies');
g.clearEnemies();
inputEvents.keydown({key:'e',repeat:false,preventDefault(){}});
assert.equal(g.getState().paused,true,'Elevator did not start Quiz');
const continueButton=document.querySelector('#continue');
continueButton.click();assert.equal(g.getState().floor,5,'Question skipped');
const right=document.querySelector('#quiz-answers').children.find(b=>b.dataset.correct==='true');
right.click();assert.ok(g.getState().quizStreak>0);
continueButton.click();assert.equal(g.getState().floor,5,'Buff skipped');
document.querySelector('#upgrade-list').children[0].click();
continueButton.click();assert.equal(g.getState().floor,6);assert.equal(g.getState().paused,false);
console.log('PASS: 27 floors across all layouts, physical traversal with open leaves, guard spawns, rendering, elevator→Quiz→buff→next sector');
