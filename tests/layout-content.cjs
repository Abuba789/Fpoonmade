const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
process.chdir(path.join(__dirname,'..'));
const context=vm.createContext({window:{},Math});
for(const file of ['map-corporate.js','map-layouts.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
const layouts=context.window.SanityMapLayouts,types=Object.keys(layouts.names),counts=new Set();
for(const id of types){
  const signatures=new Set();let min=Infinity,max=0;
  for(let seed=1;seed<=100;seed++){
    let state=seed;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
    const map=layouts.build(id,random),solid=map.props.filter(p=>p.solid);signatures.add(map.signature);
    min=Math.min(min,solid.length);max=Math.max(max,solid.length);counts.add(map.rooms.length);
    assert.ok(solid.length>=18,'Sparse layout '+id+' seed '+seed+': '+solid.length);
    const required=id==='security-office'?{console:2,server:3}:id==='corporate-leisure'?{table:6,sofa:2,coffee:2}:
      id==='departments'?{desk:4,meeting:1,cabinet:2}:{desk:4,meeting:1,server:2};
    for(const [kind,count] of Object.entries(required))assert.ok(map.props.filter(p=>p.kind===kind).length>=count,id+' missing '+kind+' seed '+seed);
    assert.equal(map.rooms.reduce((sum,r)=>sum+r.w*r.h,0),1572*976,'Incomplete floor footprint');
    for(const a of map.rooms)for(const b of map.rooms)if(a.id<b.id)
      assert.ok(!(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y),'Overlapping rooms');
    const visited=new Set([0]);
    for(let pass=0;pass<map.rooms.length;pass++)for(const c of map.connections){
      if(visited.has(c.a))visited.add(c.b);if(visited.has(c.b))visited.add(c.a);
    }
    assert.equal(visited.size,map.rooms.length,'Disconnected graph');
    for(const p of solid){
      const r=map.rooms[p.roomId];assert.ok(p.x>=r.x+20&&p.y>=r.y+20&&p.x+p.w<=r.x+r.w-20&&p.y+p.h<=r.y+r.h-20,'Invalid furniture');
      assert.ok(map.walls.some(w=>w.scenery&&w.x===p.x&&w.y===p.y),'Missing collider');
    }
  }
  assert.equal(signatures.size,100);
  console.log('PASS: '+id+', 100 unique layouts, '+min+'–'+max+' large furnishings, room graph and geometry');
}
assert.equal(counts.size,4,'Layouts should have different room structures');
const scheduled=new Set();
for(let floor=1;floor<=90;floor++){const id=layouts.forFloor(floor);assert.ok(types.includes(id));scheduled.add(id);}
assert.equal(scheduled.size,4);
console.log('PASS: all four models scheduled across 90 floors');
