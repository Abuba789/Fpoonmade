# Sprites do SANITY.exe

Adicione nesta pasta os arquivos de imagem dos personagens, inimigos, armas e objetos do jogo.

Formatos recomendados: PNG com transparência. Use nomes simples, por exemplo:

- `player.png` — protagonista
- `enemy-guard.png` — segurança
- `enemy-sniper.png` — sniper
- `enemy-samurai.png` — samurai
- `shotgun.png` — espingarda

Os arquivos ficam disponíveis no navegador por caminhos como `assets/sprites/player.png`. Para que apareçam no jogo, ainda é necessário conectá-los ao código de desenho em `game.js`.

Sprites do protagonista integrados: oito vistas direcionais PNG de 71 × 67 px, spritesheet horizontal de 568 × 67 px (8 quadros de 71 × 67 px) e turnaround animado em GIF. As vistas são selecionadas pela direção da mira. A folha contém direções estáticas, não ciclos de idle, caminhada, ataque ou morte.

A imagem original player-S.png contém duas figuras no mesmo quadro. Foram separadas sem reamostragem em player-S-facing.png e player-S-oblique.png; o jogo usa a figura frontal na direção S.

Corrida: player-run-SE.png (544 × 66), player-run-E.png (520 × 67) e player-run-NW.png (488 × 68) contêm 8 quadros cada, a 5 fps. Foram extraídos dos GIFs originais preservados nesta pasta e mantêm transparência. As animações são acionadas ao correr nessas três direções; as demais mantêm os sprites direcionais estáticos.

Direções de corrida adicionais integradas: N, NE, W e SW, cada uma com 8 quadros a 5 fps. Animações de corrida fornecidas atualmente cobrem E, NE, N, NW, W, SW e SE; ainda não há GIF de corrida para S.
