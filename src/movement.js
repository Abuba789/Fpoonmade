import {solid} from './levels.js';
export function movePlayer(p,input,room,dt,mods,settings){const k=input.keys,pr=input.pressed,m=input.mouse;p.yaw+=m.dx*(settings.mouse||.002);p.pitch=Math.max(-.75,Math.min(.75,p.pitch+(settings.invertY?1:-1)*m.dy*(settings.mouse||.002)));m.dx=m.dy=0;
 const f=(k.has('KeyW')?1:0)-(k.has('KeyS')?1:0),s=(k.has('KeyD')?1:0)-(k.has('KeyA')?1:0);let ix=Math.cos(p.yaw)*f-Math.sin(p.yaw)*s,iz=Math.sin(p.yaw)*f+Math.cos(p.yaw)*s,l=Math.hypot(ix,iz);if(l){ix/=l;iz/=l}
 if((pr.has('KeyQ')||(pr.has('ShiftLeft')&&l>0))&&p.dash>0){p.dash--;p.dashing=.16;p.dashCd=mods.dashCd?1:1.6;p.dashDir=l?{x:ix,z:iz}:{x:Math.cos(p.yaw),z:Math.sin(p.yaw)};p.invuln=mods.dashIframes?.2:0}pr.delete('KeyQ');pr.delete('ShiftLeft');
 if((pr.has('KeyC')||pr.has('ControlLeft')||pr.has('ControlRight'))&&p.ground&&Math.hypot(p.vx,p.vz)>2){p.slide=1;p.slideTimer=.65+mods.slide*.2}pr.delete('KeyC');pr.delete('ControlLeft');pr.delete('ControlRight');
 if(pr.has('Space')){if(p.ground){p.vy=7;p.ground=false;p.jumps=1}else if(p.jumps<(mods.extraJump?3:2)){p.vy=6.2;p.jumps++}}pr.delete('Space');
 const speed=(k.has('ShiftLeft')?5.8:4.2)+(mods.speed||0)*.55,acc=p.ground?24:9;if(l){p.vx+=(ix*speed-p.vx)*Math.min(1,acc*dt);p.vz+=(iz*speed-p.vz)*Math.min(1,acc*dt)}else{const brake=p.ground?10:1.8;p.vx*=Math.max(0,1-brake*dt);p.vz*=Math.max(0,1-brake*dt)}
 if(p.slide){p.slideTimer-=dt;p.vx*=.993;p.vz*=.993;if(p.slideTimer<=0)p.slide=0}if(p.dashing>0){p.dashing-=dt;p.vx=p.dashDir.x*15;p.vz=p.dashDir.z*15}
 const nx=p.x+p.vx*dt,nz=p.z+p.vz*dt,r=.22;if(!solid(room,nx-r,p.z)&&!solid(room,nx+r,p.z))p.x=nx;else p.vx=0;if(!solid(room,p.x,nz-r)&&!solid(room,p.x,nz+r))p.z=nz;else p.vz=0;
 if(!p.ground){p.vy-=18*dt;p.y+=p.vy*dt;if(p.y<=0){if(p.vy<0&&p.y<-.1&&mods.landing)p.landingBoost=.4;p.y=0;p.vy=0;p.ground=true;p.jumps=0}}if(p.dashCd>0)p.dashCd-=dt;else if(p.dash<p.dashMax){p.dash++;p.dashCd=mods.dashCd?1:1.6}p.dash=Math.min(p.dash,p.dashMax);p.invuln=Math.max(0,p.invuln-dt);p.landingBoost=Math.max(0,(p.landingBoost||0)-dt);p.bob+=dt*Math.hypot(p.vx,p.vz)*.7;p.kick=Math.max(0,p.kick-dt*3);
}
