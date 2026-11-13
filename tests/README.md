# Quiz de Redes

## Novos layouts

`node tests/layout-content.cjs` verifica 400 plantas dos quatro modelos.
O teste `stealth-runtime.cjs` cobre a integração, travessia, portas e progressão.
Veja [modelos, distribuição e prévias](../docs/map-layouts.md).

## Primeiro mapa corporativo

Execute `node tests/office-content.cjs` para validar 100 plantas diferentes,
o programa de mobiliário, os colisores e os recortes do atlas.
O teste `stealth-runtime.cjs` também cobre 15 andares do escritório em três
ciclos, a travessia com portas abertas, posições dos guardas e os handlers reais
do elevador, Quiz, buff e transição ao setor seguinte.
Veja [a documentação e a prévia](../docs/corporate-office.md).

## Portas e percepção

Execute `node tests/door-regression.cjs` para reproduzir os casos de contato
perto das dobradiças a 60/144/240 FPS e verificar a recuperação de portas
bloqueadas por inimigos sem espaço para recuar.

Execute `node tests/stealth-runtime.cjs` para testar o módulo e os hooks reais
do jogo: visão por cone e linha de visão, paredes e portas, abertura dos dois
lados, colisões e atordoamento, investigação de tiros, perda de contato e memória.
O teste também gera 100 mapas reproduzíveis nos três setores e verifica todas as
salas, portas e a movimentação através de portas abertas e fechadas.
O DOM e o canvas são adaptados para esse teste; a aparência deve ser conferida
abrindo index.html em um navegador.

Controles: aproxime-se de uma porta e pressione E para empurrar. As portas
permanecem abertas. Inimigos em IDLE guardam sua posição; inimigos em busca
podem abrir portas. O som da espingarda percorre as conexões das salas e perde
alcance nas portas fechadas. Abrir portas e caminhar não emite alerta.
Portas que possuem espaço giram; em passagens estreitas as folhas recolhem.

## Quiz

Execute os testes de dados e dos handlers reais do jogo com Node:

```powershell
node tests/quiz-runtime.cjs
```

O teste cobre as 30 questões, gabaritos, quatro alternativas, níveis de STREAK,
repetições, dados inválidos e 60 respostas com feedback, cores e bloqueio.
O DOM é simulado nesse teste; ele não substitui a verificação no navegador.

Para testar no Chrome instalado:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests/run-quiz.ps1
```

O script gera uma cópia temporária da página e injeta os testes dentro de uma
cópia do código do jogo, sem expor controles de teste na versão normal.
Verifica também carregamento dos sprites, seleção/aplicação de buffs,
bloqueio do botão de continuar e transições nos andares 1, 5, 6, 10, 11, 15 e 16.
As cópias são removidas ao terminar.

Para adicionar questões, edite as linhas de questions.js usando ID único,
categoria, dificuldade (facil/media/dificil), enunciado, quatro alternativas,
índice correto (0–3) e explicação. A seleção reinicia somente o nível esgotado.
O teste de gabaritos deve ser ampliado quando novas questões forem adicionadas.
