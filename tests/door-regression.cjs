const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
process.chdir(path.join(__dirname,'..'));global.window=global;
vm.runInThisContext(fs.readFileSync('stealth.js','utf8'));
const s=SanityStealth;
for(const axis of ['vertical','horizontal'])for(const side of [-1,1])for(const offset of [-30,0,30])for(const fps of [60,144,240]){
  const d={type:'passage',axis,x:axis==='vertical'?-12:-48,y:axis==='vertical'?-48:-12,w:axis==='vertical'?24:96,h:axis==='vertical'?96:24};
  s.setup([d]);
  const actor={x:axis==='vertical'?side*15.01:offset,y:axis==='vertical'?offset:side*15.01,r:12};
  assert.ok(!s.blocked(actor.x,actor.y,actor.r,[d]),'Valid starting position');
  s.open(d,actor,[],[d]);
  for(let frame=0;frame<fps;frame++)s.updateDoors([d],1/fps,[actor],[],[],()=>{});
  assert.equal(d.progress,1,axis+' side '+side+' offset '+offset+' '+fps+'fps: door stuck against opener');
  assert.ok(!s.blocked(0,0,12,[d]),'Open center blocked');
}
console.log('PASS: 36 flush-to-door interactions, both axes/sides and 60/144/240 fps');
for(const axis of ['vertical','horizontal'])for(const side of [-1,1]){
  const d={type:'passage',axis,x:axis==='vertical'?-12:-48,y:axis==='vertical'?-48:-12,w:axis==='vertical'?24:96,h:axis==='vertical'?96:24};
  s.setup([d]);
  const actor={x:axis==='vertical'?-side*24:0,y:axis==='vertical'?0:-side*24,r:12};
  const guard={x:axis==='vertical'?side*24:20,y:axis==='vertical'?20:side*24,r:13,stun:0};
  const wall=axis==='vertical'?{x:side>0?38:-68,y:-60,w:30,h:120}:{x:-60,y:side>0?38:-68,w:120,h:30};
  let impacts=0;
  s.open(d,actor,[],[d]);
  for(let frame=0;frame<120;frame++){
    s.updateDoors([d],1/144,[actor,guard],[guard],[wall],()=>impacts++);
    assert.ok(!s.blocked(actor.x,actor.y,actor.r,[d]),'Opener crushed');
    assert.ok(!s.blocked(guard.x,guard.y,guard.r,[d]),'Guard crushed');
  }
  assert.equal(d.progress,1,'Jammed door blocks progression');
  assert.equal(impacts,1,'Repeated impact');
  assert.ok(d.sliding,'Jammed rotation should retract');
}
console.log('PASS: jam recovery without crushing or repeated impact on both axes/sides');
