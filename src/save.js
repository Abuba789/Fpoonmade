const KEY='sanity-exe-profile-v1';
const defaults=()=>({best:0,runs:0,settings:{mouse:.002,invertY:false,scanlines:true,shake:true,lowFx:false,adrenaline:true,difficulty:'normal',volume:.3},unlocks:['pistol','smg','shotgun','blade','rail']});
export function loadProfile(){try{const p=JSON.parse(localStorage.getItem(KEY)||'null');const d=defaults();return p?{...d,...p,settings:{...d.settings,...p.settings},unlocks:(p.unlocks||d.unlocks).filter(k=>d.unlocks.includes(k))}:d}catch{return defaults()}}
export function saveProfile(p){try{localStorage.setItem(KEY,JSON.stringify(p))}catch{}}
export function recordRun(profile,score){profile.runs++;profile.best=Math.max(profile.best,score);saveProfile(profile)}
