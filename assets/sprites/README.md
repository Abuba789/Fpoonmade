# Sprites do SANITY.exe

As poses estáticas do protagonista vêm da folha de referência
`player-spritesheet.png`. O jogo usa os PNGs individuais e escolhe a pose
pela direção da mira. A pose sul frontal está em `player-S.png`. A segunda
figura da referência sul está em `player-S-oblique.png`, e a composição
original está em `player-S-composite-source.png`.

As folhas `player-run-{E,SE,S,SW,W,NW,N,NE}.png` têm 576 × 72 px.
Cada uma contém oito quadros horizontais de 72 × 72 px, reproduzidos a
5 fps. A margem é transparente e o limite inferior do ciclo fica na linha
68 (índice a partir de zero). O recorte usa os limites do ciclo inteiro
para preservar o deslocamento original entre os quadros.

As sete folhas com GIF de origem preservam a ordem dos quadros. O ciclo
sul foi montado a partir da pose frontal, com movimento alternado das
pernas. A corrida segue a direção do movimento, inclusive durante o dash.
Em repouso, o jogo aplica uma respiração discreta à pose da mira,
mantendo o ponto de apoio no chão.
