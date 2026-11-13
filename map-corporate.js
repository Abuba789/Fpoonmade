(() => {
  'use strict';
  const WALL=20, CLEARANCE=32;
  const overlap=(a,b,pad=0)=>a.x<b.x+b.w+pad&&a.x+a.w>b.x-pad&&a.y<b.y+b.h+pad&&a.y+a.h>b.y-pad;
  const center=r=>({x:r.x+r.w/2,y:r.y+r.h/2});
  const anchor=r=>r.kind==='meeting'?{x:r.x+r.w/2,y:r.y+r.h-64}:center(r);
  const contains=(r,p,margin=0)=>p.x>=r.x+margin&&p.x<=r.x+r.w-margin&&p.y>=r.y+margin&&p.y<=r.y+r.h-margin;
  const bounds=(p,w,h)=>({x:p.x-w/2,y:p.y-h/2,w,h});
  // World dimensions and silhouettes. Sprite source boxes are measured once from alpha.
  const catalog=[
    {key:'desk',w:94,h:78,solid:true},{key:'chair',w:27,h:34},
    {key:'meeting',w:176,h:98,solid:true},{key:'cabinet',w:44,h:60,solid:true},
    {key:'sofa',w:104,h:57,solid:true},{key:'plant',w:35,h:38},
    {key:'server',w:40,h:70,solid:true},{key:'console',w:116,h:88,solid:true},
    {key:'vending',w:44,h:69,solid:true},{key:'coffee',w:100,h:76,solid:true},
    {key:'boxes',w:52,h:53,solid:true},{key:'credenza',w:84,h:45,solid:true},
    {key:'table',w:64,h:64,solid:true},{key:'bin',w:21,h:26},
    {key:'copier',w:52,h:57,solid:true},{key:'armchair',w:46,h:48,solid:true}
  ];
  function build(random=Math.random) {
    const ri=(a,b)=>Math.round((a+random()*(b-a))/2)*2;
    const x0=84,x1=1656,y0=72,y1=1048;
    const hallY=ri(414,452),hallH=136,northX=ri(1000,1070),northW=132;
    const west=ri(416,468),southX=ri(548,610),southW=128,east=ri(1140,1196),lower=ri(864,882);
    const room=(id,kind,label,x,y,w,h,material)=>({id,kind,label,x,y,w,h,material,open:{north:[],east:[],south:[],west:[]}});
    const rooms=[
      room(0,'reception','RECEPCAO / CONTROLE',x0,y0,west-x0,hallY-y0,'slate'),
      room(1,'work','OPERACOES / ANALISE',west,y0,northX-west,hallY-y0,'carpet'),
      room(2,'corridor','ACESSO EXECUTIVO',northX,y0,northW,hallY-y0,'slate'),
      room(3,'meeting','SALA DO CONSELHO',northX+northW,y0,x1-northX-northW,hallY-y0,'wood'),
      room(4,'corridor','CIRCULACAO / DEPARTAMENTOS',x0,hallY,x1-x0,hallH,'slate'),
      room(5,'archive','ARQUIVO / ESTOQUE',x0,hallY+hallH,southX-x0,y1-hallY-hallH,'utility'),
      room(6,'corridor','ACESSO TECNICO',southX,hallY+hallH,southW,y1-hallY-hallH,'slate'),
      room(7,'support','SUPORTE / INFRAESTRUTURA',southX+southW,hallY+hallH,east-southX-southW,y1-hallY-hallH,'carpet'),
      room(8,'break','COPA / CONVIVENCIA',east,hallY+hallH,x1-east,lower-hallY-hallH,'tile'),
      room(9,'exit','EXPEDICAO / ELEVADOR',east,lower,x1-east,y1-lower,'utility')
    ];
    const connections=[],doors=[];
    function connect(ai,bi,fraction=.5) {
      const a=rooms[ai],b=rooms[bi],id=connections.length;
      let axis,cx,cy;
      if(Math.abs(a.x+a.w-b.x)<1||Math.abs(b.x+b.w-a.x)<1){
        axis='vertical';cx=Math.max(a.x,b.x);
        const min=Math.max(a.y,b.y)+76,max=Math.min(a.y+a.h,b.y+b.h)-76;cy=Math.round(min+(max-min)*fraction);
      }else{
        axis='horizontal';cy=Math.max(a.y,b.y);
        const min=Math.max(a.x,b.x)+76,max=Math.min(a.x+a.w,b.x+b.w)-76;cx=Math.round(min+(max-min)*fraction);
      }
      connections.push({id,a:ai,b:bi});
      doors.push({type:'passage',axis,x:cx-(axis==='vertical'?WALL/2:48),y:cy-(axis==='vertical'?48:WALL/2),
        w:axis==='vertical'?WALL:96,h:axis==='vertical'?96:WALL,roomId:ai,roomIds:[ai,bi],connection:id});
    }
    [[0,4],[1,4],[1,2],[2,3],[3,4],[2,4],[4,5],[4,6],[4,7],[4,8],[5,6],[6,7],[8,9]]
      .forEach(([a,b])=>connect(a,b,a===2&&b===3?.8:b===8||a===8?.45+random()*.1:.25+random()*.5));
    if(random()<.65)connect(0,1,.2+random()*.6);
    if(random()<.65)connect(7,8,.95);
    if(random()<.4)connect(7,9,.25+random()*.5);
    const spawn={...center(rooms[0])},exit={...center(rooms[9])};
    const mirrored=random()<.5;
    if(mirrored){
      for(const r of rooms)r.x=x0+x1-r.x-r.w;
      for(const d of doors)d.x=x0+x1-d.x-d.w;
      spawn.x=x0+x1-spawn.x;exit.x=x0+x1-exit.x;
    }
    const walls=buildWalls(rooms,doors),props=[];
    const map={id:'corporate-office',name:'ESCRITORIO CORPORATIVO',rooms,connections,doors,walls,props,spawn,exit,mirrored,
      bounds:{x:x0,y:y0,w:x1-x0,h:y1-y0},floorRegions:rooms.map(r=>({...r,x:r.x+10,y:r.y+10,w:r.w-20,h:r.h-20})),
      signature:[hallY,northX,west,southX,east,lower,mirrored].join(':')};
    furnish(map,random);
    return map;
  }
  function buildWalls(rooms,doors) {
    const lines=new Map();
    const add=(axis,pos,start,end)=>{
      const key=axis+':'+pos;
      if(!lines.has(key))lines.set(key,{axis,pos,segments:[]});
      lines.get(key).segments.push([start,end]);
    };
    for(const r of rooms){
      add('horizontal',r.y,r.x,r.x+r.w);add('horizontal',r.y+r.h,r.x,r.x+r.w);
      add('vertical',r.x,r.y,r.y+r.h);add('vertical',r.x+r.w,r.y,r.y+r.h);
    }
    const walls=[];
    for(const {axis,pos,segments} of lines.values()){
      const merged=[];
      for(const segment of segments.sort((a,b)=>a[0]-b[0])){
        const prev=merged[merged.length-1];
        if(prev&&segment[0]<=prev[1])prev[1]=Math.max(prev[1],segment[1]);else merged.push([...segment]);
      }
      const openings=doors.filter(d=>d.axis===axis&&Math.abs((axis==='vertical'?d.x+d.w/2:d.y+d.h/2)-pos)<1)
        .map(d=>axis==='vertical'?[d.y,d.y+d.h]:[d.x,d.x+d.w]).sort((a,b)=>a[0]-b[0]);
      for(const [start,end] of merged){
        let cursor=start;
        for(const [left,right] of openings){
          if(right<=start||left>=end)continue;
          if(left>cursor)emit(cursor,left);cursor=Math.max(cursor,right);
        }
        if(cursor<end)emit(cursor,end);
        function emit(a,b){walls.push(axis==='vertical'?{x:pos-WALL/2,y:a,w:WALL,h:b-a}:{x:a,y:pos-WALL/2,w:b-a,h:WALL});}
      }
    }
    return walls;
  }
  function furnish(map,random) {
    const reservations=new Map(map.rooms.map(r=>[r.id,[bounds(anchor(r),76,76)]]));
    for(const d of map.doors){
      const p={x:d.x+d.w/2,y:d.y+d.h/2};
      for(const id of d.roomIds){
        const r=map.rooms[id],c=anchor(r),routes=reservations.get(id);
        routes.push(bounds(p,154,154));
        // Explicit 64px circulation spine to each doorway; no furniture crosses it.
        const bend=d.axis==='vertical'?{x:c.x,y:p.y}:{x:p.x,y:c.y};
        for(const [a,b] of [[p,bend],[bend,c]])routes.push({x:Math.min(a.x,b.x)-CLEARANCE,y:Math.min(a.y,b.y)-CLEARANCE,w:Math.abs(a.x-b.x)+CLEARANCE*2,h:Math.abs(a.y-b.y)+CLEARANCE*2});
      }
    }
    function place(r,index,x,y,angle=0) {
      const def=catalog[index],swap=Math.abs(Math.sin(angle))>.5;
      const w=swap?def.h:def.w,h=swap?def.w:def.h,rect={x:Math.round(x-w/2),y:Math.round(y-h/2),w,h};
      if(!contains(r,{x:rect.x,y:rect.y},20)||!contains(r,{x:rect.x+w,y:rect.y+h},20))return null;
      if(def.solid&&reservations.get(r.id).some(route=>overlap(rect,route,5)))return null;
      if(!def.solid&&map.doors.some(d=>overlap(rect,{x:d.x-42,y:d.y-42,w:d.w+84,h:d.h+84})))return null;
      if(map.props.some(p=>overlap(rect,p,def.solid?15:5)))return null;
      const prop={...rect,index,kind:def.key,angle,roomId:r.id,solid:!!def.solid};
      map.props.push(prop);
      if(def.solid)map.walls.push({...rect,scenery:true,propKind:def.key,roomId:r.id});
      return prop;
    }
    for(const r of map.rooms){
      if(r.kind==='corridor')continue;
      const c=center(r);
      if(r.kind==='meeting'){
        const table=place(r,2,c.x,c.y-32);
        if(table){
          for(const x of [-58,0,58])for(const y of [-72,72])place(r,1,c.x+x,c.y-32+y,y<0?Math.PI:0);
        }
      }
      const candidates=[];
      // Side bays and corners create cover while leaving routes to all doors clear.
      for(const y of [r.y+66,r.y+r.h-66]){
        for(let x=r.x+78;x<r.x+r.w-62;x+=116)candidates.push({x,y,angle:0});
      }
      for(const x of [r.x+68,r.x+r.w-68]){
        for(let y=r.y+154;y<r.y+r.h-92;y+=112)candidates.push({x,y,angle:Math.PI/2});
      }
      // Shuffle candidates, not the architecture's guaranteed circulation routes.
      for(let i=candidates.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
      const sequence={
        reception:[0,4,15,14,11,5,5,13],
        work:[0,0,0,0,0,0,14,3,11,5,13],
        meeting:[2,11,3,5,5],
        archive:[3,3,10,3,10,11,10,3,10,3,11,10,5],
        support:[7,6,6,0,0,14,11,3,6,5],
        security:[7,7,7,6,6,0,3,14,6,11,5],
        servers:[6,6,6,6,6,6,7,3,10,6,6,13],
        kitchen:[9,9,9,8,11,11,3,10,9,5],
        dining:[12,12,12,12,12,12,12,12,12,12,12,12,8,9,5,5,13],
        lounge:[4,4,15,15,12,8,5,5,4,13],
        garden:[5,5,5,5,5,4,15,12,5,5,5,4],
        lobby:[0,0,4,4,4,4,15,15,12,14,11,5,5,5,5,8],
        executive:[0,2,4,15,11,3,5,5],
        break:[9,8,4,12,15,5,13],
        exit:[11,3,5,5]
      }[r.kind];
      for(const index of sequence){
        const islands=[];
        if(r.kind==='dining'&&index===12){
          for(const y of [r.y+110,r.y+r.h-110])
            for(let x=r.x+110;x<r.x+r.w-90;x+=132)islands.push({x,y,angle:0});
        }
        const bays=[...islands,...candidates],def=catalog[index];
        for(const angle of [0,Math.PI/2]){
          const w=angle?def.h:def.w,h=angle?def.w:def.h;
          for(let y=r.y+20+h/2;y<=r.y+r.h-20-h/2;y+=24)
            for(let x=r.x+20+w/2;x<=r.x+r.w-20-w/2;x+=24)bays.push({x,y,angle});
        }
        // Furniture-specific rotations keep desks and storage facing into rooms.
        for(const pos of bays){
          const prop=place(r,index,pos.x,pos.y,index===2?0:pos.angle);
          if(!prop)continue;
          if([0,2,7,12].includes(index)){
            const offsets=index===2?[-58,0,58]:[0];
            for(const offset of offsets){
              const turn=prop.angle,local={x:offset,y:(catalog[index].h/2)+24};
              place(r,1,pos.x+local.x*Math.cos(turn)-local.y*Math.sin(turn),pos.y+local.x*Math.sin(turn)+local.y*Math.cos(turn),turn);
            }
          }
          break;
        }
      }
      // Scatter small non-blocking paper debris, away from doors and the entry.
      for(let n=0;n<8;n++){
        const x=r.x+36+random()*(r.w-72),y=r.y+38+random()*(r.h-76);
        if(Math.hypot(x-c.x,y-c.y)<45)continue;
        map.props.push({x:Math.round(x),y:Math.round(y),w:5,h:4,index:-1,kind:'paper',roomId:r.id,solid:false,angle:0});
      }
    }
    // Tactically meaningful guard locations; the spawn routine still checks collision and spacing.
    map.guardPosts=map.rooms.filter(r=>r.id!==0&&r.id!==map.rooms.length-1).flatMap(r=>{
      const c=anchor(r),kind=['support','security','servers'].includes(r.kind)?'equipment':['meeting','executive'].includes(r.kind)?'guard':r.kind==='corridor'?'corridor':'department';
      return [{...c,roomId:r.id,role:kind},{x:c.x+r.w*.2,y:c.y+r.h*.18,roomId:r.id,role:kind}];
    }).filter(p=>!map.walls.some(w=>overlap(bounds(p,44,44),w))&&Math.hypot(p.x-map.spawn.x,p.y-map.spawn.y)>225);
  }
  function roomCandidates(map,type) {
    const role=type==='bot'?'equipment':type==='sniper'||type==='elite'?'guard':type==='police'?'corridor':'department';
    return [...map.guardPosts.filter(p=>p.role===role),...map.guardPosts.filter(p=>p.role!==role)];
  }
  function reachable(nav,start) {
    const seen=new Uint8Array(nav.walk.length),queue=new Int32Array(nav.walk.length);
    if(start<0)return seen;
    let head=0,tail=0;seen[start]=1;queue[tail++]=start;
    while(head<tail){
      const i=queue[head++],x=i%nav.cols,y=(i/nav.cols)|0;
      for(const n of [x>0?i-1:-1,x+1<nav.cols?i+1:-1,y>0?i-nav.cols:-1,y+1<nav.rows?i+nav.cols:-1]){
        if(n<0||seen[n]||!nav.walk[n])continue;seen[n]=1;queue[tail++]=n;
      }
    }
    return seen;
  }
  // Shared assembly keeps all layouts on the same door, collision and furniture systems.
  function assemble(id,name,rooms,links,random=Math.random) {
    const connections=[],doors=[];
    for(const [ai,bi,fraction=.5] of links){
      const a=rooms[ai],b=rooms[bi],vertical=Math.abs(a.x+a.w-b.x)<.01||Math.abs(b.x+b.w-a.x)<.01;
      const horizontal=Math.abs(a.y+a.h-b.y)<.01||Math.abs(b.y+b.h-a.y)<.01;
      if(!vertical&&!horizontal)throw Error('Disconnected room boundary: '+id+' '+ai+'/'+bi);
      const start=vertical?Math.max(a.y,b.y):Math.max(a.x,b.x);
      const end=vertical?Math.min(a.y+a.h,b.y+b.h):Math.min(a.x+a.w,b.x+b.w);
      if(end-start<116)throw Error('Passage too narrow: '+id+' '+ai+'/'+bi);
      const inset=Math.min(58,(end-start)/2);
      const pos=Math.round(start+inset+(end-start-inset*2)*fraction);
      const axis=vertical?'vertical':'horizontal',cx=vertical?Math.max(a.x,b.x):pos,cy=vertical?pos:Math.max(a.y,b.y);
      const connection=connections.length;connections.push({id:connection,a:ai,b:bi});
      doors.push({type:'passage',axis,x:cx-(vertical?10:48),y:cy-(vertical?48:10),w:vertical?20:96,h:vertical?96:20,roomId:ai,roomIds:[ai,bi],connection});
    }
    const spawn=center(rooms[0]),exit=center(rooms[rooms.length-1]),mirrored=random()<.5;
    if(mirrored){
      for(const r of rooms)r.x=1740-r.x-r.w;
      for(const d of doors)d.x=1740-d.x-d.w;
      spawn.x=1740-spawn.x;exit.x=1740-exit.x;
    }
    const map={id,name,rooms,doors,connections,spawn,exit,mirrored,walls:buildWalls(rooms,doors),props:[],
      bounds:{x:84,y:72,w:1572,h:976},floorRegions:rooms.map(r=>({...r,x:r.x+10,y:r.y+10,w:r.w-20,h:r.h-20})),
      signature:id+':'+rooms.map(r=>[r.x,r.y,r.w,r.h].join(',')).join(';')+':'+links.map(l=>l.join(',')).join(';')};
    furnish(map,random);return map;
  }
  window.SanityOffice={build,assemble,catalog,roomCandidates,reachable};
})();
