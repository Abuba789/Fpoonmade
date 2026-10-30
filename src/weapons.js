import {spawnProjectile} from './combat.js';
export const WEAPONS=[
 {key:'pistol',name:'HEADCASE',type:'pistol',mag:12,rate:.24,damage:38,reload:1,spread:.012,color:'#e8f8f2'},
 {key:'smg',name:'BRAINROT UZI',type:'smg',mag:36,rate:.075,damage:10,reload:.9,spread:.04,color:'#caff00'},
 {key:'shotgun',name:'DOUBLE TROUBLE',type:'shotgun',mag:2,rate:.68,damage:13,pellets:10,reload:1.25,spread:.13,color:'#ff49b8'},
 {key:'blade',name:'HARD RESET',type:'blade',mag:0,rate:.24,damage:32,range:2.4,color:'#caff00'},
 {key:'rail',name:'BLUE SCREEN',type:'rail',mag:5,rate:.72,damage:78,reload:1.4,spread:.002,color:'#55eaff'},
];
export function currentWeapon(p){return WEAPONS[p.weapon]}
export function tickWeapon(s,input,dt,damageEnemy){const p=s.player;for(let i=0;i<WEAPONS.length;i++)if(input.consume(`Digit${i+1}`)){p.weapon=i;p.reload=0;s.toast=WEAPONS[i].name;s.toastTime=1}
 if(input.consume('KeyR')){const w=currentWeapon(p);if(w.mag&&p.ammo[w.key]<w.mag&&p.reserve[w.key]>0&&p.reload<=0){p.reload=w.reload/(1+s.mods.reload*.25);s.audio.play('reload')}}
 if(p.reload>0){p.reload=Math.max(0,p.reload-dt);if(p.reload===0){const w=currentWeapon(p),n=Math.min(w.mag-p.ammo[w.key],p.reserve[w.key]);p.ammo[w.key]+=n;p.reserve[w.key]-=n}}
 const w=currentWeapon(p),rightHeld=input.mouse.buttons.has(2);let charged=false;if(w.key==='rail'&&rightHeld&&p.reload<=0&&p.ammo.rail>0){p.charge=Math.min(1,(p.charge||0)+dt*.85)}else if(w.key==='rail'&&(p.charge||0)>0&&!rightHeld&&p.reload<=0){fire(s,w,damageEnemy,true,p.charge);p.charge=0;charged=true}
 s._autoFire=input.mouse.buttons.has(0)||input.mouse.pressed.has(0);if(!charged&&!(w.key==='rail'&&rightHeld)&&s._autoFire&&p.reload<=0){p.cooldown=(p.cooldown||0)-dt;if(p.cooldown<=0)fire(s,w,damageEnemy,false)}else if(!s._autoFire)p.cooldown=0;
 if(input.consume('KeyF'))fire(s,WEAPONS[3],damageEnemy,false);
}
function fire(s,w,damageEnemy,alt,charge=0){const p=s.player;if(w.mag&&p.ammo[w.key]<=0){s.toast='SEM MUNIÇÃO · R RECARREGA';s.toastTime=.8;return}if(w.mag&&(p.infiniteTime||0)<=0)p.ammo[w.key]--;p.cooldown=w.rate/(1+s.mods.fireRate*.08);p.kick=.65;s.crossKick=8;s.audio.play(({pistol:'pistol',shotgun:'shotgun',smg:'smg',rifle:'rifle',rail:'rail',launcher:'boom',axe:'axe',blade:'blade'})[w.type]||'shot');s.flash={color:w.color,time:.07};
 if(w.type==='launcher'){spawnProjectile(s,p.x+Math.cos(p.yaw)*.5,p.z+Math.sin(p.yaw)*.5,Math.cos(p.yaw)*12,Math.sin(p.yaw)*12,1.1,w.damage*(1+s.mods.explosive*.25),'#ff5838',2.8+s.mods.explosive*.65);return}
 if(w.type==='blade'){for(const e of s.enemies){if(e.hp<=0)continue;const dx=e.x-p.x,dz=e.z-p.z,d=Math.hypot(dx,dz),a=Math.atan2(dz,dx)-p.yaw;if(d<w.range+s.mods.meleeRange*.3&&Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<.7){damageEnemy(e,w.damage*(1+s.mods.gunDamage*.1)*(e.armor>0&&w.type==='blade'?1.8+s.mods.axe*.35:1));if(s.mods.bleed)e.bleed=2}}return}
 const pellets=w.type==='shotgun'?w.pellets+s.mods.pellets:1;const spread=w.spread*(1-s.mods.accuracy*.1);for(let i=0;i<pellets;i++){const angle=p.yaw+(Math.random()-.5)*spread;let targetE=null,targetD=38;for(const candidate of s.enemies){if(candidate.hp<=0)continue;const tx=candidate.x-p.x,tz=candidate.z-p.z,d=Math.hypot(tx,tz);if(d>=targetD)continue;const a=Math.atan2(tz,tx)-angle,limit=candidate.type==='drone'?.42:candidate.boss?.3:.24;if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))>=limit)continue;if(candidate.type!=='drone'&&Math.abs(Math.atan2((candidate.y||1.2)-(1.35+p.y),d)-p.pitch)>=.25)continue;targetE=candidate;targetD=d}if(targetE){const head=Math.abs(Math.atan2((targetE.y||1.35)-(1.35+p.y),targetD)-p.pitch)<.08;damageEnemy(targetE,w.damage*(head?2*(1+s.mods.headshot*.3):1)*(1+s.mods.gunDamage*.2)*(alt&&w.type==='rail'?1.55*(1+charge*.8):1)*(w.type==='shotgun'?1:1)*(targetE.type==='drone'?1.6:1),head);if(s.mods.pierce&&w.type==='rail'){const second=s.enemies.find(e=>e!==targetE&&e.hp>0&&Math.hypot(e.x-targetE.x,e.z-targetE.z)<4);if(second)damageEnemy(second,w.damage*.5)}if(s.mods.ricochet){const bounce=s.enemies.find(e=>e!==targetE&&e.hp>0&&Math.hypot(e.x-targetE.x,e.z-targetE.z)<3);if(bounce)damageEnemy(bounce,w.damage*.45)}}}
}
