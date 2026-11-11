(() => {
  'use strict';

  const dialogue = document.querySelector('#quiz-ai-dialogue');
  const lines = {
    correct: [
      ['Correto. Talvez eu tenha subestimado você.', 'Muito bem. Uma resposta certa ainda não é um padrão.', 'Parece que ainda existe inteligência nesta empresa.'],
      ['Você está melhorando. Isso não estava nos meus cálculos.', 'Correto de novo. Vou ter de recalibrar minhas expectativas.', 'Admito... isso está ficando interessante.'],
      ['Quantas respostas ainda pretende acertar?', 'Correto. Estou começando a suspeitar do meu próprio diagnóstico.', 'Essa sequência já devia ter terminado. Como você está fazendo isso?'],
      ['Você está começando a representar uma anomalia.', 'Outra resposta correta. Vou precisar de um protocolo só para você.', 'A corporação prefere resultados previsíveis. Você começa a me dar trabalho.']
    ],
    wrong: [
      ['Incorreto. Que decepção.', 'Até um dos meus processos secundários saberia responder.', 'Sério? Você realmente não sabia disso?'],
      ['Eu estava começando a rever seu diagnóstico. Que precipitação.', 'Você tinha encontrado um ritmo. Tinha.', 'Sua sequência me convenceu por alguns segundos. Poucos, mas contei.'],
      ['Aí está o erro que eu vinha esperando.', 'Eu já começava a desconfiar. Obrigada por voltar ao normal.', 'Uma sequência tão longa, e era esta a pergunta que faltava?'],
      ['Finalmente. A anomalia ainda é humana.', 'Uma falha. Eu quase precisei avisar a diretoria.', 'Sua sequência acabou. A investigação sobre você continua.']
    ]
  };
  let lastLine = '';

  function react(correct, streak) {
    const tier = streak >= 8 ? 3 : streak >= 4 ? 2 : streak >= 2 ? 1 : 0;
    const mood = correct ? 'correct' : 'wrong';
    const options = lines[mood][tier].filter(line => line !== lastLine);
    const sample = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
    lastLine = options[Math.floor(sample * options.length)];
    dialogue.dataset.mood = mood;
    dialogue.textContent = lastLine;
  }

  function clear() {
    dialogue.textContent = '';
    delete dialogue.dataset.mood;
  }

  window.SanityAIDialogue = { react, clear };
})();
