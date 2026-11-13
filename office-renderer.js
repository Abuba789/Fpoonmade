(() => {
  'use strict';
  // Alpha bounds measured from corporate-furniture.png. No runtime pixel readback.
  const sources=[[42,64,251,218],[388,55,164,242],[636,82,294,177],[998,51,198,240],
    [16,404,284,154],[358,362,229,224],[711,335,145,276],[957,374,281,212],
    [67,651,177,268],[329,686,282,209],[672,683,222,209],[959,719,277,151],
    [45,985,223,242],[391,992,155,209],[653,969,247,257],[991,995,212,217]];
  const surfaces={
    slate:{base:'#42434b',light:'#4b4d55',dark:'#36373e'},
    carpet:{base:'#382733',light:'#49313f',dark:'#2d202d'},
    wood:{base:'#573b32',light:'#6b493a',dark:'#352d2e'},
    utility:{base:'#353b40',light:'#41494d',dark:'#252d33'},
    tile:{base:'#6b6263',light:'#797170',dark:'#4a464d'},
    circuit:{base:'#293940',light:'#344950',dark:'#192b34'},
    deck:{base:'#444a3a',light:'#59604a',dark:'#2b352e'}
  };
  function makeCanvas(){
    const canvas=document.createElement('canvas');canvas.width=870;canvas.height=560;
    const context=canvas.getContext('2d');context.imageSmoothingEnabled=false;context.scale(.5,.5);
    return {canvas,context};
  }
  function texture(ctx,r) {
    const palette=surfaces[r.material],x0=r.x+10,y0=r.y+10,w=r.w-20,h=r.h-20;
    ctx.save();ctx.beginPath();ctx.rect(x0,y0,w,h);ctx.clip();
    ctx.fillStyle=palette.base;ctx.fillRect(x0,y0,w,h);
    if(r.material==='wood'){
      for(let y=y0;y<y0+h;y+=12){
        ctx.fillStyle=palette.dark;ctx.fillRect(x0,y,w,2);
        for(let x=x0+((y-y0)%24?24:0);x<x0+w;x+=64){
          ctx.fillStyle=palette.light;ctx.fillRect(x+4,y+4,40,2);
          ctx.fillStyle=palette.dark;ctx.fillRect(x,y,2,12);
        }
      }
    }else if(r.material==='carpet'){
      for(let y=y0;y<y0+h;y+=8)for(let x=x0;x<x0+w;x+=8){
        ctx.fillStyle=((x+y)%24)?palette.light:palette.dark;ctx.fillRect(x+2,y+2,2,2);
      }
      ctx.strokeStyle='#673748';ctx.lineWidth=3;ctx.strokeRect(x0+12,y0+12,w-24,h-24);
    }else{
      const tile=r.material==='tile'?24:32;
      for(let y=y0;y<y0+h;y+=tile)for(let x=x0;x<x0+w;x+=tile){
        if(((x-x0)/tile+(y-y0)/tile)%2===0){ctx.fillStyle=palette.light;ctx.fillRect(x+2,y+2,tile-3,tile-3);}
        ctx.fillStyle=palette.dark;ctx.fillRect(x,y,tile,2);ctx.fillRect(x,y,2,tile);
        ctx.fillStyle=palette.light;ctx.fillRect(x+6,y+tile-5,tile-12,1);
      }
    }
    // Wall occlusion and a thin inlaid corporate-red border.
    ctx.fillStyle='rgba(2,4,9,.3)';ctx.fillRect(x0,y0,w,12);ctx.fillRect(x0,y0,8,h);
    if(r.kind==='corridor'){
      ctx.fillStyle='#982940';ctx.fillRect(x0+6,y0+6,w-12,3);
      ctx.fillStyle='#20232c';ctx.fillRect(x0+8,y0+h-8,w-16,3);
      const c={x:r.x+r.w/2,y:r.y+r.h/2};
      ctx.fillStyle='#858083';ctx.font='8px monospace';
      if(r.w>r.h)for(let x=x0+68;x<x0+w-30;x+=170){ctx.fillText('> >',x,c.y+3);}
      else for(let y=y0+68;y<y0+h-30;y+=120){ctx.fillRect(c.x-7,y,14,2);ctx.fillRect(c.x-4,y+4,8,2);}
    }
    ctx.restore();
  }
  function fixture(ctx,prop,atlas) {
    if(prop.index<0){
      ctx.fillStyle='#c1a5a4';ctx.fillRect(prop.x,prop.y,5,4);
      ctx.fillStyle='#6f5867';ctx.fillRect(prop.x+1,prop.y+1,3,1);return;
    }
    if(!atlas)return;
    const [sx,sy,sw,sh]=sources[prop.index],def=window.SanityOffice.catalog[prop.index];
    const scale=Math.min(def.w/sw,def.h/sh),dw=Math.round(sw*scale/2)*2,dh=Math.round(sh*scale/2)*2;
    ctx.save();ctx.translate(Math.round(prop.x+prop.w/2),Math.round(prop.y+prop.h/2));ctx.rotate(prop.angle);
    ctx.fillStyle='rgba(2,3,9,.38)';
    if(prop.solid)ctx.fillRect(-dw/2+4,-dh/2+7,dw,dh);
    ctx.drawImage(atlas,sx,sy,sw,sh,-dw/2,-dh/2,dw,dh);
    ctx.restore();
  }
  function prepare(map,atlas) {
    const floor=makeCanvas(),objects=makeCanvas(),f=floor.context,c=objects.context;
    f.fillStyle='#080a12';f.fillRect(0,0,1740,1120);
    f.fillStyle='#13151e';f.fillRect(map.bounds.x+8,map.bounds.y+12,map.bounds.w+8,map.bounds.h+8);
    for(const room of map.rooms)texture(f,room);
    for(const room of map.rooms){
      if(room.kind==='corridor')continue;
      const x=room.x+24,y=room.y+24;
      f.fillStyle='#171921';f.fillRect(x-3,y-9,Math.min(room.w-48,room.label.length*5+12),18);
      f.fillStyle='#c8a6ab';f.font='bold 9px monospace';f.fillText(room.label,x+3,y+3);
    }
    // Entrance runner and exit hazard markings don't add physical obstacles.
    f.fillStyle='#75253b';f.fillRect(map.spawn.x-38,map.spawn.y-40,76,80);
    f.fillStyle='#a54a59';f.fillRect(map.spawn.x-33,map.spawn.y-36,2,72);f.fillRect(map.spawn.x+31,map.spawn.y-36,2,72);
    f.fillStyle='#c4b6ae';f.font='8px monospace';f.fillText('ENTRADA',map.spawn.x-18,map.spawn.y+54);
    f.fillStyle='#1e232c';f.fillRect(map.exit.x-54,map.exit.y-48,108,96);
    for(let n=0;n<6;n++){
      f.fillStyle=n%2?'#a7454a':'#302932';
      f.fillRect(map.exit.x-54+n*18,map.exit.y-48,12,6);
      f.fillRect(map.exit.x-54+n*18,map.exit.y+42,12,6);
    }
    for(const prop of map.props.filter(p=>!p.solid))fixture(f,prop,atlas);
    for(const wall of map.walls.filter(w=>!w.scenery)){
      c.fillStyle='rgba(0,0,0,.48)';c.fillRect(wall.x+6,wall.y+8,wall.w,wall.h);
      c.fillStyle='#080a10';c.fillRect(wall.x-2,wall.y-2,wall.w+4,wall.h+4);
      c.fillStyle='#85838b';c.fillRect(wall.x,wall.y,wall.w,wall.h);
      c.fillStyle='#30323c';c.fillRect(wall.x+3,wall.y+3,Math.max(0,wall.w-6),Math.max(0,wall.h-6));
      c.fillStyle='#b3344e';
      if(wall.w>wall.h)c.fillRect(wall.x+3,wall.y+wall.h-6,Math.max(0,wall.w-6),3);
      else c.fillRect(wall.x+wall.w-6,wall.y+3,3,Math.max(0,wall.h-6));
      c.fillStyle='#b1a9ae';
      if(wall.w>wall.h){for(let x=wall.x+12;x<wall.x+wall.w-8;x+=64)c.fillRect(x,wall.y+3,10,2);}
      else{for(let y=wall.y+12;y<wall.y+wall.h-8;y+=64)c.fillRect(wall.x+3,y,2,10);}
    }
    for(const prop of map.props.filter(p=>p.solid))fixture(c,prop,atlas);
    // Baked pools of screen light: a few tiny translucent pixels, no per-frame blur.
    for(const prop of map.props.filter(p=>['desk','server','console'].includes(p.kind))){
      f.fillStyle='rgba(58,184,177,.07)';f.fillRect(prop.x-8,prop.y+prop.h-4,prop.w+16,18);
    }
    map.layers={floor:floor.canvas,fixtures:objects.canvas};
  }
  const drawFloor=(ctx,map)=>ctx.drawImage(map.layers.floor,0,0,1740,1120);
  const drawFixtures=(ctx,map)=>ctx.drawImage(map.layers.fixtures,0,0,1740,1120);
  window.SanityOfficeRenderer={prepare,drawFloor,drawFixtures,sources};
})();
