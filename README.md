# SANITY.exe

Um boomer shooter 2.5D de navegador, feito com HTML5, CSS e JavaScript ES modules. O renderizador Canvas usa raycasting para o cenário e sprites billboards desenhados proceduralmente para os inimigos; não há dependências remotas nem instalação de Three.js.

## Rodar no navegador

O navegador bloqueia os imports de módulos quando `index.html` é aberto diretamente como `file://`. Sirva a pasta localmente:

1. No VS Code, instale/ative **Live Server**, clique com o botão direito em `index.html` e selecione **Open with Live Server**; ou
2. Abra um terminal nesta pasta, execute `python -m http.server 8000` e visite `http://localhost:8000`.

## Controles

- WASD: mover; mouse: mirar; Shift: correr e dash direcional; Q: dash.
- Espaço: pular / salto duplo; Ctrl ou C: slide.
- Clique esquerdo: disparar ou atacar; botão direito: tiro alternativo da BLUE SCREEN.
- R: recarregar; 1–5: trocar armas; E: entrar no elevador após limpar a sala; Esc: pausar.

Configurações, recorde e número de runs são salvos no LocalStorage. Os sprites, cenários, efeitos e áudio são criados pelo próprio jogo; as pastas de assets servem para substituir esses recursos por arquivos próprios depois.

## Módulos

`src/main.js` conecta o loop. Movimento, armas, combate, inimigos, níveis, melhorias roguelike, efeitos, renderização, UI, áudio e salvamento ficam em módulos próprios.
