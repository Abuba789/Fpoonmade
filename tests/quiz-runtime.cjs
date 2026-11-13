const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
process.chdir(path.join(__dirname, '..'));
const assert = require('node:assert/strict');
global.window = global;
vm.runInThisContext(fs.readFileSync('questions.js','utf8'));
const bank = SANITY_QUESTIONS, api = SanityQuizBank;
assert.equal(bank.length,30);
bank.forEach(q=>assert.ok(api.isValid(q),q.id));
assert.equal(new Set(bank.map(q=>q.id)).size,30);
const keys=[2,1,1,0,1,0,1,0,1,3,0,0,1,1,2,0,2,0,2,2,0,1,2,1,3,2,1,2,3,1];
bank.forEach((q,i)=>assert.equal(q.correctAnswer,keys[i],q.id));
for(const streak of [0,1,2,3,4,20]){
  const seen=[], level=api.levelFor(streak), size=bank.filter(q=>q.difficulty===level).length;
  let last;const cycle=new Set();
  for(let i=0;i<size*4;i++){
    if(i%size===0)cycle.clear();
    const q=api.select(bank,streak,seen,last,()=>0);
    assert.equal(q.difficulty,level);assert.notEqual(q.id,last);assert.ok(!cycle.has(q.id));
    cycle.add(q.id);last=q.id;
  }
}
const history=['osi',...bank.filter(q=>q.difficulty==='media').map(q=>q.id)];
api.select(bank,2,history);assert.ok(history.includes('osi'));
for(const invalid of [{...bank[0],options:['a']},{...bank[0],correctAnswer:4},
  {...bank[0],correctAnswer:[0,1]},{...bank[0],options:['x','x','y','z']}])
  assert.equal(api.select([invalid],0,[]),null);
console.log('PASS: all 30 questions, answer keys, difficulty, repetition and invalid entries');

// Minimal DOM used only to exercise the actual game handlers in isolation.
class Element {
  constructor(){this.children=[];this.dataset={};this.textContent='';this.disabled=false;
    this.classList={values:new Set(),add:(...v)=>v.forEach(x=>this.classList.values.add(x)),
      remove:(...v)=>v.forEach(x=>this.classList.values.delete(x)),
      contains:v=>this.classList.values.has(v)};}
  set className(v){this.classList.values=new Set(v.split(' '));}
  set innerHTML(v){this.children=[];}
  appendChild(v){this.children.push(v);}
  querySelectorAll(){return this.children;}
  querySelector(){return this.children.find(b=>b.dataset.correct==='true');}
  click(){if(!this.disabled)this.onclick();}
}
const elements=new Map();
global.document={querySelector:s=>{if(!elements.has(s))elements.set(s,new Element());return elements.get(s)},
  createElement:()=>new Element()};
global.SanityAIDialogue={clear(){},react(correct,streak){this.last={correct,streak}}};
global.SanityQuizEyes={react(correct){this.last=correct}};
const source=fs.readFileSync('game.js','utf8');
new vm.Script(source);new vm.Script(fs.readFileSync('ai-eyes.js','utf8'));
const handlers=source.slice(source.indexOf('function showQuestion()'),source.indexOf('function clearFloor()'));
const context=vm.createContext({window:global,document,Math,player:{hp:50,maxHp:100,damage:1},
  quizStreak:0,quizRecent:[],currentQuestion:null,questionAnswered:false,rewardPending:false,
  upgradeChosen:false,renderBuffChoices(){context.rewardPending=true;},updateUI(){}});
vm.runInContext(handlers,context);
for(const q of bank){
  SANITY_QUESTIONS=[q];
  for(const correct of [true,false]){
    context.quizStreak=q.difficulty==='facil'?0:q.difficulty==='media'?2:4;
    const before=context.quizStreak;context.quizRecent=[];
    context.showQuestion();
    const buttons=document.querySelector('#quiz-answers').children;
    assert.equal(buttons.length,4);
    buttons.forEach((b,i)=>assert.ok(b.textContent.startsWith('ABCD'[i]+'. ')));
    assert.equal(buttons.filter(b=>b.dataset.correct==='true').length,1);
    const chosen=buttons.find(b=>b.dataset.correct===String(correct));chosen.click();
    assert.equal(context.quizStreak,correct?before+1:0,q.id);
    assert.ok(buttons.every(b=>b.disabled));
    assert.ok(buttons.find(b=>b.dataset.correct==='true').classList.contains('correct'));
    assert.ok(chosen.classList.contains(correct?'correct':'incorrect'));
    const feedback=document.querySelector('#quiz-feedback').textContent;
    assert.ok(feedback.includes(q.explanation));
    assert.ok(feedback.startsWith(correct?'CORRECT ANSWER':'INCORRECT ANSWER'));
    chosen.onclick();assert.equal(context.quizStreak,correct?before+1:0);
    assert.equal(SanityAIDialogue.last.streak,correct?before+1:before);
    assert.equal(SanityQuizEyes.last,correct);
  }
}
SANITY_QUESTIONS=bank;
console.log('PASS: actual quiz handlers for all 30 questions, 60 responses, colors, explanations, streak, double-answer lock and AI calls');
