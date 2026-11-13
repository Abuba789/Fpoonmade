// Records the real renderer's canvas commands for the Windows PNG exporter.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.join(__dirname,'..'));
let seed=19;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
class RecordingCanvas {
  constructor(){this.width=0;this.height=0;this.commands=[];}
  getContext(){
    const target={canvas:this};
    const methods=['scale','save','restore','beginPath','rect','clip','translate','rotate',
      'fillRect','strokeRect','fillText','drawImage'];
    for(const method of methods)target[method]=(...args)=>{
      if(method==='drawImage')args[0]=args[0].path;
      this.commands.push({op:method,args,fill:target.fillStyle,stroke:target.strokeStyle,
        width:target.lineWidth,font:target.font});
    };
    return target;
  }
}
const sandbox={window:null,Math,document:{createElement:()=>new RecordingCanvas()}};
sandbox.window=sandbox;
const context=vm.createContext(sandbox);
for(const file of ['stealth.js','map-corporate.js','map-layouts.js','office-renderer.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
const map=sandbox.SanityMapLayouts.build(process.argv[2]||'corporate-office',random);
sandbox.SanityStealth.setup(map.doors);
sandbox.SanityOfficeRenderer.prepare(map,{path:'assets/maps/corporate-furniture.png'});
const doorLayer=new RecordingCanvas();doorLayer.width=870;doorLayer.height=560;
const ctx=doorLayer.getContext();ctx.scale(.5,.5);
for(const door of map.doors)sandbox.SanityStealth.drawDoor(ctx,door);
ctx.drawImage({path:'assets/player/idle/S.png'},0,0,224,224,map.spawn.x-24,map.spawn.y-39,48,48);
ctx.fillStyle='#d7b1b2';ctx.font='bold 10px monospace';ctx.fillText('ELEVADOR',map.exit.x-28,map.exit.y+32);
ctx.fillStyle='#701e35';ctx.fillRect(map.exit.x-24,map.exit.y-27,48,54);
ctx.fillStyle='#ff5473';ctx.fillRect(map.exit.x-20,map.exit.y-23,40,4);
const output={layers:[map.layers.floor,map.layers.fixtures,doorLayer].map(c=>({width:c.width,height:c.height,commands:c.commands}))};
fs.writeFileSync('tests/office-preview.generated.json',JSON.stringify(output));
console.log('Recorded '+map.id+', '+map.rooms.length+' rooms, '+map.props.filter(p=>p.solid).length+' large furnishings');
