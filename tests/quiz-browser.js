// Injected into a temporary copy of the game's closure by run-quiz.ps1.
(async () => {
  const results = [];
  const assert = (condition, message) => { if (!condition) throw Error(message); };
  const bank = window.SANITY_QUESTIONS, api = window.SanityQuizBank;
  const originalBank = bank;
  try {
    assert(bank.length >= 20, 'At least 20 questions');
    assert(new Set(bank.map(q => q.id)).size === bank.length, 'Unique IDs');
    bank.forEach(q => assert(api.isValid(q), 'Invalid question: ' + q.id));
    // Independent expected answer text, also detects accidental option/index changes.
    const expected = ['7.','32 bits.','Traduzir nomes de domínio em endereços IP.',
      'Atribuir automaticamente configurações de rede aos dispositivos.',
      'TCP oferece entrega confiável e controle de transmissão.',
      'Encaminhar quadros com base nos endereços MAC.','Encaminhar pacotes entre redes diferentes.',
      'HTTPS utiliza TLS para proteger a comunicação.',
      'Um endereço de enlace associado a uma interface de rede.','128 bits.',
      'Resolver endereços IPv4 em endereços MAC na rede local.',
      'Traduzir endereços IP, permitindo, por exemplo, que vários dispositivos compartilhem um endereço IPv4 público.',
      '255.255.255.0.','ping.','Não possui garantia de entrega ou ordenação dos dados.',
      'Conectar dispositivos Wi-Fi à rede local cabeada.','Estrela.',
      'Ethernet por par trançado: cabo; Wi-Fi: ondas de rádio.','Internet.','Rede.',
      '62.','192.168.10.64.','192.168.1.191.','DNS e sua configuração no cliente.',
      '192.168.1.1.','Permitir a porta do serviço HTTPS necessário e negar entradas não autorizadas.',
      'SAE.','10.1.0.0/16.','tracert.','OSPF.'];
    bank.forEach((q,i) => assert(q.options[q.correctAnswer] === expected[i], 'Answer key: '+q.id));
    results.push('PASS: 30 schemas and independent answer keys');
    for (const streak of [0,1,2,3,4,12]) {
      const seen=[], cycle=new Set(), tier=api.levelFor(streak);
      const size=bank.filter(q=>q.difficulty===tier).length;
      let last;
      for(let i=0;i<size*3;i++){
        const q=api.select(bank,streak,seen,last,()=>0);
        assert(q.difficulty===tier,'Difficulty');
        assert(q.id!==last,'Immediate repetition');
        if(i%size===0)cycle.clear();
        assert(!cycle.has(q.id),'Repeated before tier exhausted');
        cycle.add(q.id);last=q.id;
      }
    }
    const seen=['osi','ipv4',...bank.filter(q=>q.difficulty==='media').map(q=>q.id)];
    api.select(bank,2,seen);
    assert(seen.includes('osi')&&seen.includes('ipv4'),'Other tier history retained');
    const q=bank[0];
    for(const invalid of [{...q,options:q.options.slice(0,3)}, {...q,correctAnswer:4},
      {...q,correctAnswer:[0,1]}, {...q,options:['x','x','z','w']}])
      assert(api.select([invalid],0,[])===null,'Invalid entry accepted');
    results.push('PASS: difficulty, exhaustion, cross-tier history and invalid data');
    await new Promise(resolve => {
      const wait=()=>Assets.ready?resolve():setTimeout(wait,20);wait();
    });
    assert(!Assets.missing.length,'Missing sprites');
    player={};floor=1;startFloor();
    for(const item of bank) {
      window.SANITY_QUESTIONS=[item];
      quizRecent=[];quizStreak=item.difficulty==='facil'?0:item.difficulty==='media'?2:4;
      clearFloor();
      const before=quizStreak;
      assert(currentQuestion.id===item.id,'Selected question');
      const buttons=[...document.querySelectorAll('.quiz-answer')];
      assert(buttons.length===4,'Rendered four choices');
      buttons.forEach((b,i)=>assert(b.textContent.startsWith('ABCD'[i]+'. '),'Labels'));
      assert(buttons.filter(b=>b.dataset.correct==='true').length===1,'Single correct choice');
      const good=buttons.find(b=>b.dataset.correct==='true');
      good.click();
      assert(quizStreak===before+1,'Streak increment');
      assert(buttons.every(b=>b.disabled),'Buttons disabled');
      assert(good.classList.contains('correct'),'Green correct answer');
      assert(document.querySelector('#quiz-feedback').textContent.includes(item.explanation),'Explanation');
      assert(document.querySelector('#quiz-feedback').textContent.startsWith('CORRECT ANSWER'),'Correct feedback');
      good.onclick();
      assert(quizStreak===before+1,'Repeated callback blocked');
      assert(rewardPending,'Buff selection available');
      document.querySelector('.buff-choice').click();
      assert(upgradeChosen&&!rewardPending,'Buff choice applies');
      quizRecent=[];quizStreak=before;clearFloor();
      const wrong=document.querySelector('[data-correct="false"]');
      wrong.click();
      assert(quizStreak===0,'Wrong resets streak');
      assert(wrong.classList.contains('incorrect'),'Red wrong choice');
      assert(document.querySelector('[data-correct="true"]').classList.contains('correct'),'Reveal correct');
      assert(document.querySelector('#quiz-feedback').textContent.startsWith('INCORRECT ANSWER'),'Wrong feedback');
      assert(document.querySelector('#quiz-ai-dialogue').textContent,'AI reaction');
    }
    window.SANITY_QUESTIONS=originalBank;
    results.push('PASS: every question rendered and answered correctly/incorrectly; buffs, lock and AI');
    for(const target of [1,5,6,10,11,15,16]) {
      floor=target;startFloor();quizStreak=0;clearFloor();
      assert(paused&&!document.querySelector('#quiz').classList.contains('hidden'),'Floor quiz '+target);
      document.querySelector('#continue').click();
      assert(floor===target,'Cannot skip question');
      document.querySelector('[data-correct="true"]').click();
      document.querySelector('#continue').click();
      assert(floor===target,'Cannot skip buff');
      document.querySelector('.buff-choice').click();
      document.querySelector('#continue').click();
      assert(floor===target+1&&!paused,'Next floor');
    }
    results.push('PASS: floor transitions 1,5,6,10,11,15,16');
    active=false;paused=true;window.SanityQuizEyes.hide();
    document.body.dataset.quizTests='passed';
  } catch(error) {
    results.push('FAIL: '+error.stack);
    document.body.dataset.quizTests='failed';
  } finally {
    window.SANITY_QUESTIONS=originalBank;
    const report=document.createElement('pre');report.id='test-results';
    report.textContent=results.join('\n');document.body.append(report);
  }
})();
