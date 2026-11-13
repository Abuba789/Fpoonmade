const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
process.chdir(path.join(__dirname,'..'));
const context=vm.createContext({window:{},Math});
vm.runInContext(fs.readFileSync('map-corporate.js','utf8'),context);
const office=context.window.SanityOffice;
vm.runInContext(fs.readFileSync('office-renderer.js','utf8'),context);
const png=fs.readFileSync('assets/maps/corporate-furniture.png');
const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
for(const [x,y,w,h] of context.window.SanityOfficeRenderer.sources)
  assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=width&&y+h<=height,'Sprite source outside atlas');
assert.equal(png[25],6,'Atlas must have RGBA transparency');
const signatures=new Set();let min=Infinity,max=0;
for(let seed=1;seed<=100;seed++){
  let state=seed;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const map=office.build(random);signatures.add(map.signature);
  const solid=map.props.filter(p=>p.solid);min=Math.min(min,solid.length);max=Math.max(max,solid.length);
  for(const kind of ['desk','meeting','cabinet','server','sofa','coffee'])
    assert.ok(map.props.some(p=>p.kind===kind),'Missing '+kind+' seed '+seed);
  assert.equal(map.rooms.length,10);
  assert.ok(solid.length>=20,'Sparse map seed '+seed+': '+solid.length);
  for(const prop of solid){
    const room=map.rooms[prop.roomId];
    assert.ok(prop.x>=room.x+20&&prop.y>=room.y+20&&prop.x+prop.w<=room.x+room.w-20&&prop.y+prop.h<=room.y+room.h-20,'Furniture outside room');
    assert.ok(map.walls.some(w=>w.scenery&&w.x===prop.x&&w.y===prop.y),'Missing collider');
  }
}
assert.equal(signatures.size,100);
console.log('PASS: 100 unique office plans, furniture programs and colliders ('+min+'–'+max+' large objects each)');
