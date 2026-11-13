(() => {
  'use strict';
  const names={
    'corporate-office':'ESCRITORIO CORPORATIVO',
    'security-office':'CENTRAL DE SEGURANCA',
    'corporate-leisure':'CONVIVENCIA CORPORATIVA',
    'departments':'CORREDOR DE DEPARTAMENTOS'
  };
  function build(id,random=Math.random) {
    if(id==='corporate-office')return window.SanityOffice.build(random);
    if(!names[id])throw Error('Unknown map layout: '+id);
    const ri=(a,b)=>Math.round((a+random()*(b-a))/2)*2,rooms=[],links=[];
    const room=(kind,label,x,y,w,h,material='slate')=>{
      const r={id:rooms.length,kind,label,x,y,w,h,material,open:{north:[],east:[],south:[],west:[]}};
      rooms.push(r);return r.id;
    };
    const connect=(a,b,f)=>links.push([a,b,f===undefined?.35+random()*.3:f]);
    if(id==='security-office'){
      const top=ri(318,346),bottom=ri(716,742),left=ri(440,490),right=ri(1230,1290),split=ri(820,900);
      room('reception','PORTARIA / CREDENCIAIS',84,72,left-84,top-72);
      room('security','MONITORAMENTO / CAMERAS',left,72,right-left,top-72,'circuit');
      room('archive','ARMARIA / EQUIPAMENTOS',right,72,1656-right,top-72,'utility');
      room('corridor','ANEL / ACESSO NORTE',84,top,1572,128);
      room('corridor','RONDA OESTE',84,top+128,128,bottom-top-128);
      room('security','CENTRAL DE VIGILANCIA',212,top+128,split-212,bottom-top-128,'circuit');
      room('servers','NUCLEO / SERVIDORES',split,top+128,1528-split,bottom-top-128,'utility');
      room('corridor','RONDA LESTE',1528,top+128,128,bottom-top-128);
      room('corridor','ANEL / ACESSO SUL',84,bottom,1572,128);
      room('archive','ARQUIVO DE INCIDENTES',84,bottom+128,490,920-bottom,'utility');
      room('support','MANUTENCAO / REDUNDANCIA',574,bottom+128,602,920-bottom,'circuit');
      room('exit','SAIDA / ELEVADOR',1176,bottom+128,480,920-bottom,'utility');
      [[0,3],[1,3],[2,3],[3,4],[3,7],[4,8],[7,8],[3,5],[3,6],[4,5],[6,7],[5,8],[6,8],[8,9],[8,10],[8,11]].forEach(([a,b])=>connect(a,b));
      if(random()<.65)connect(5,6);
      if(random()<.5)connect(9,10);
    }else if(id==='corporate-leisure'){
      const west=ri(440,500),east=ri(1140,1180),top=ri(304,328),bottom=ri(728,750),garden=ri(578,600),exitY=ri(850,864);
      room('reception','ACESSO / CONVIVENCIA',84,72,west-84,top-72);
      room('kitchen','COZINHA / LINHA DE SERVICO',west,72,east-west,top-72,'tile');
      room('archive','DESPENSA / ESTOQUE',east,72,1656-east,top-72,'utility');
      room('dining','REFEITORIO / MESAS',84,top,east-84,bottom-top,'wood');
      room('corridor','GALERIA / JARDIM INTERNO',east,top,128,exitY-top);
      room('lounge','LOUNGE / DESCANSO',east+128,top,1528-east,garden-top,'carpet');
      room('garden','JARDIM / AREA DE CONVIVIO',east+128,garden,1528-east,exitY-garden,'deck');
      room('corridor','CIRCULACAO / FUNCIONARIOS',84,bottom,east-84,128);
      room('archive','APOIO / LIMPEZA',84,bottom+128,490,920-bottom,'utility');
      room('break','COPA / FUNCIONARIOS',574,bottom+128,east-574,920-bottom,'tile');
      room('exit','SAIDA / ELEVADOR',east,exitY,1656-east,1048-exitY,'utility');
      [[0,3],[1,3],[2,4],[3,4],[3,7],[4,5],[4,6],[4,10],[6,10],[7,8],[7,9],[9,10]].forEach(([a,b])=>connect(a,b));
      if(random()<.7)connect(1,2);
      if(random()<.65)connect(5,6);
      if(random()<.5)connect(8,9);
    }else{
      const hallX=ri(774,810),hallW=156,entryY=ri(800,820),exitY=ri(242,260),westTop=ri(394,418),westBottom=ri(610,634),eastTop=ri(390,412),eastBottom=ri(626,650);
      room('lobby','RECEPCAO / DEPARTAMENTOS',84,entryY,1572,1048-entryY,'slate');
      room('corridor','EIXO CENTRAL / DIRETORIA',hallX,exitY,hallW,entryY-exitY,'slate');
      room('meeting','REUNIAO / FINANCEIRO',84,72,hallX-84,westTop-72,'wood');
      room('work','PROJETOS / ENGENHARIA',84,westTop,hallX-84,westBottom-westTop,'carpet');
      room('archive','ARQUIVO / DOCUMENTOS',84,westBottom,hallX-84,entryY-westBottom,'utility');
      room('executive','GABINETE / DIRETORIA',hallX+hallW,72,1656-hallX-hallW,eastTop-72,'wood');
      room('work','RECURSOS HUMANOS',hallX+hallW,eastTop,1656-hallX-hallW,eastBottom-eastTop,'carpet');
      room('support','TI / SUPORTE',hallX+hallW,eastBottom,1656-hallX-hallW,entryY-eastBottom,'circuit');
      room('exit','ELEVADOR EXECUTIVO',hallX,72,hallW,exitY-72,'utility');
      [[0,1],[0,4],[0,7],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8]].forEach(([a,b])=>connect(a,b,a===1&&b===2?.9:a===1&&[3,4,6,7].includes(b)?1:undefined));
      for(const [a,b] of [[2,3],[3,4],[5,6],[6,7]])if(random()<.55)connect(a,b);
    }
    return window.SanityOffice.assemble(id,names[id],rooms,links,random);
  }
  function forFloor(floor) {
    const sector=Math.floor(((floor-1)%15)/5),cycle=Math.floor((floor-1)/15),local=(floor-1)%5;
    const pools=[
      ['corporate-office','security-office','departments','corporate-office','security-office'],
      ['corporate-leisure'],
      ['departments','security-office','departments','security-office','departments']
    ];
    const pool=pools[sector];return pool[(local+cycle)%pool.length];
  }
  window.SanityMapLayouts={build,forFloor,names};
})();
