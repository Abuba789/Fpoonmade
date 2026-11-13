(() => {
  'use strict';
  const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  const pointSegment = (p,a,b) => {
    const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));
    return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
  };
  function intersects(a,b,c,d) {
    const cross=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
    const x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b);
    if(x*y<0&&z*w<0)return true;
    return (Math.abs(x)<1e-8&&pointSegment(c,a,b)<1e-8) ||
      (Math.abs(y)<1e-8&&pointSegment(d,a,b)<1e-8) ||
      (Math.abs(z)<1e-8&&pointSegment(a,c,d)<1e-8) ||
      (Math.abs(w)<1e-8&&pointSegment(b,c,d)<1e-8);
  }
  function rayRect(a,b,r) {
    if(a.x>=r.x&&a.x<=r.x+r.w&&a.y>=r.y&&a.y<=r.y+r.h)return true;
    const p={x:r.x,y:r.y},q={x:r.x+r.w,y:r.y},s={x:r.x+r.w,y:r.y+r.h},t={x:r.x,y:r.y+r.h};
    return intersects(a,b,p,q)||intersects(a,b,q,s)||intersects(a,b,s,t)||intersects(a,b,t,p);
  }
  function leaves(d, progress=d.progress) {
    const vertical=d.axis==='vertical',length=46*(d.sliding?1-progress:1);
    return [-1,1].map(side=>{
      const hinge={x:d.cx+(vertical?0:side*46),y:d.cy+(vertical?side*46:0)};
      const base=vertical?(side<0?Math.PI/2:-Math.PI/2):(side<0?0:Math.PI);
      const angle=base+(d.sliding?0:d.direction*side*progress*Math.PI/2);
      return {a:hinge,b:{x:hinge.x+Math.cos(angle)*length,y:hinge.y+Math.sin(angle)*length}};
    });
  }
  function setup(doors) {
    for(const d of doors.filter(d=>d.type==='passage')){
      d.cx=d.x+d.w/2;d.cy=d.y+d.h/2;d.progress=0;d.opening=false;d.direction=1;
      d.sliding=false;d.hit=new Set();d.blockedFor=0;
    }
  }
  function blocked(x,y,r,doors) {
    return doors.some(d=>d.type==='passage'&&leaves(d).some(s=>pointSegment({x,y},s.a,s.b)<r+3));
  }
  function lineOfSight(a,b,walls,doors) {
    return !walls.some(w=>rayRect(a,b,w))&&!doors.some(d=>d.type==='passage'&&leaves(d).some(s=>intersects(a,b,s.a,s.b)));
  }
  function open(d,actor,walls,doors) {
    if(d.opening||d.progress>=1)return false;
    const side=d.axis==='vertical'?actor.x-d.cx:actor.y-d.cy;
    d.direction=d.axis==='vertical'?(side<0?1:-1):(side<0?-1:1);
    // Tight procedural corridors use telescopic metal leaves inside the frame.
    // Otherwise both leaves rotate away from the interacting actor.
    d.sliding=false;
    for(let t=.1;t<=1.001;t+=.1)for(const s of leaves(d,t)){
      for(let u=.15;u<=1;u+=.1){
        const p={x:s.a.x+(s.b.x-s.a.x)*u,y:s.a.y+(s.b.y-s.a.y)*u};
        if(walls.some(w=>p.x>w.x-3&&p.x<w.x+w.w+3&&p.y>w.y-3&&p.y<w.y+w.h+3)||
          doors.some(other=>other!==d&&other.type==='passage'&&leaves(other).some(o=>pointSegment(p,o.a,o.b)<6)))
          d.sliding=true;
      }
    }
    d.opening=true;d.blockedFor=0;d.hit.clear();return true;
  }
  function updateDoors(doors,dt,actors,enemies,walls,onImpact) {
    if(dt<=0)return;
    for(const d of doors.filter(d=>d.type==='passage'&&d.opening&&d.progress<1)){
      const target=Math.min(1,d.progress+dt/0.19);
      // Small angular steps prevent a swinging leaf skipping an actor.
      const count=Math.max(1,Math.ceil((target-d.progress)/.025)),step=(target-d.progress)/count;
      let stalled=false;
      for(let n=0;n<count;n++){
        const next=d.progress+step,segments=leaves(d,next);
        let obstructed=false;
        if(!d.sliding)for(const actor of actors){
          // Match blocked(): the extra pixel previously trapped an opener who
          // was touching the closed leaf, even though it was rotating away.
          if(!segments.some(s=>pointSegment(actor,s.a,s.b)<actor.r+3))continue;
          if(enemies.includes(actor)&&!d.hit.has(actor)){
            d.hit.add(actor);actor.stun=Math.max(actor.stun||0,.85);onImpact(actor,d);
          }
          const axis=d.axis==='vertical'?'x':'y',sign=axis==='x'?d.direction:-d.direction;
          const pos={x:actor.x,y:actor.y};pos[axis]+=sign*(actor.r+7);
          if(!walls.some(w=>pos.x+actor.r>w.x&&pos.x-actor.r<w.x+w.w&&pos.y+actor.r>w.y&&pos.y-actor.r<w.y+w.h)&&
            !doors.some(other=>other!==d&&other.type==='passage'&&leaves(other).some(s=>pointSegment(pos,s.a,s.b)<actor.r+3))&&
            !segments.some(s=>pointSegment(pos,s.a,s.b)<actor.r+3)){
            actor.x=pos.x;actor.y=pos.y;
          }else obstructed=true;
        }
        if(obstructed){stalled=true;break;}
        d.progress=next;
      }
      d.blockedFor=stalled?(d.blockedFor||0)+dt:0;
      if(stalled&&d.blockedFor>=.18){
        // Reuse the existing telescopic animation instead of crushing an actor
        // or leaving a mandatory doorway permanently jammed. Preserve clearance.
        d.progress=Math.sin(d.progress*Math.PI/2);
        d.sliding=true;d.blockedFor=0;
      }
      if(d.progress>=1-1e-7){d.progress=1;d.opening=false;}
    }
  }
  const visionRange=e=>(e.type==='sniper'?1050:e.type==='samurai'?1300:660)+(e.detectionBonus||0);
  function canSee(e,p,walls,doors) {
    const a=Math.atan2(p.y-e.y,p.x-e.x),delta=Math.atan2(Math.sin(a-e.angle),Math.cos(a-e.angle));
    return distance(e,p)<=visionRange(e)&&Math.abs(delta)<=Math.PI/3&&lineOfSight(e,p,walls,doors);
  }
  function perceive(e,p,dt,walls,doors) {
    e.state=e.state||'IDLE';e.memory=Math.max(0,(e.memory||0)-dt);
    e.visible=canSee(e,p,walls,doors);
    if(e.visible){
      e.state='COMBAT';e.memory=5;e.lastKnown={x:p.x,y:p.y};
    }else if(e.state==='COMBAT')e.state='SEARCHING';
    else if(e.state==='ALERTED')e.state='SEARCHING';
    if(!e.visible&&e.state!=='IDLE'&&e.memory<=0){
      e.state='IDLE';e.lastKnown=null;e.pathTarget=null;
    }
    e.alert=e.state!=='IDLE';
    return e.lastKnown;
  }
  function roomAt(p,rooms) {
    return rooms.find(r=>p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h);
  }
  function noise(origin,enemies,rooms,connections,doors,radius=1250,walls=[]) {
    const centers=rooms.map(r=>({x:r.x+r.w/2,y:r.y+r.h/2}));
    const costs=rooms.map(()=>Infinity),source=roomAt(origin,rooms);
    if(source)costs[source.id]=0;
    else for(const c of connections){
      const a=rooms[c.a],b=rooms[c.b];
      if(origin.x>=Math.min(a.x,b.x)&&origin.x<=Math.max(a.x+a.w,b.x+b.w)&&
        origin.y>=Math.min(a.y,b.y)&&origin.y<=Math.max(a.y+a.h,b.y+b.h)){
        costs[c.a]=distance(origin,centers[c.a]);costs[c.b]=distance(origin,centers[c.b]);
      }
    }
    const visited=new Set();
    for(let i=0;i<rooms.length;i++){
      let id=-1;for(let k=0;k<costs.length;k++)if(!visited.has(k)&&(id<0||costs[k]<costs[id]))id=k;
      if(id<0||costs[id]===Infinity)break;visited.add(id);
      for(const c of connections.filter(c=>c.a===id||c.b===id)){
        const next=c.a===id?c.b:c.a;
        const damp=doors.filter(d=>d.connection===c.id&&d.progress<.8).length*145;
        costs[next]=Math.min(costs[next],costs[id]+distance(centers[id],centers[next])+damp);
      }
    }
    for(const e of enemies){
      const room=roomAt(e,rooms)||rooms.reduce((best,r)=>!best||distance(e,centers[r.id])<distance(e,centers[best.id])?r:best,null);
      if(!room)continue;
      const localDamping=room===source?walls.filter(w=>rayRect(origin,e,w)).length*80+
        doors.filter(d=>d.type==='passage'&&d.progress<.8&&leaves(d).some(s=>intersects(origin,e,s.a,s.b))).length*145:0;
      const cost=(room===source?distance(e,origin):costs[room.id]+distance(e,centers[room.id])*.4)+localDamping;
      if(cost>radius)continue;
      // A sound is a remembered region, never a live reference to the player.
      if(e.visible&&e.state==='COMBAT')continue;
      e.state=cost>radius*.8?'SUSPICIOUS':'ALERTED';e.alert=true;e.memory=6;
      e.lastKnown={x:origin.x+Math.round(Math.sin(e.phase||0)*18),y:origin.y+Math.round(Math.cos(e.phase||0)*18)};
      e.pathTimer=0;e.pathTarget=null;
    }
  }
  function drawDoor(ctx,d) {
    const vertical=d.axis==='vertical';
    ctx.fillStyle='#08090d';
    ctx.fillRect(d.cx-(vertical?14:51),d.cy-(vertical?51:14),vertical?28:102,vertical?102:28);
    ctx.fillStyle='#a3273c';
    for(const side of [-1,1])ctx.fillRect(d.cx+(vertical?-13:side*48-3),d.cy+(vertical?side*48-3:-13),vertical?26:6,vertical?6:26);
    for(const s of leaves(d)){
      const length=distance(s.a,s.b);if(length<.5)continue;
      ctx.save();ctx.translate(s.a.x,s.a.y);ctx.rotate(Math.atan2(s.b.y-s.a.y,s.b.x-s.a.x));
      ctx.fillStyle='#050609';ctx.fillRect(0,-5,length,10);
      ctx.fillStyle='#62616b';ctx.fillRect(0,-4,length,8);
      ctx.fillStyle='#23232c';ctx.fillRect(3,-2,Math.max(0,length-5),5);
      ctx.fillStyle='#ef2948';ctx.fillRect(4,-3,Math.max(0,length-8),2);
      ctx.fillStyle='#94929b';ctx.fillRect(0,-5,5,10);ctx.restore();
    }
  }
  function drawAwareness(ctx,e) {
    if(e.stun>0){ctx.fillStyle='#ffe399';ctx.fillRect(e.x-9,e.y-25,4,3);ctx.fillRect(e.x+5,e.y-25,4,3);return;}
    if(e.state==='IDLE')return;
    ctx.fillStyle=e.state==='COMBAT'?'#ff304c':'#e9b76c';
    ctx.font='bold 10px monospace';ctx.fillText(e.state==='COMBAT'?'!':'?',e.x-3,e.y-23);
  }
  window.SanityStealth={pointSegment,rayRect,leaves,setup,blocked,lineOfSight,open,updateDoors,canSee,perceive,noise,drawDoor,drawAwareness,visionRange};
})();
