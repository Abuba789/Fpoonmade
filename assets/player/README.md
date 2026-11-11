# Protagonista do SANITY.exe

Arte recortada de Sprite Sheet Cyberpunko em Pixel Art.png (1536 × 1024).
Os PNGs mantêm a escala dos pixels e a transparência do original. Os
quadros do protagonista usam células horizontais de 224 × 224 px, com
âncora no centro horizontal e linha de apoio em y = 218. Os efeitos são
recortados individualmente.

| Pasta | Quadros usados |
| --- | --- |
| idle | Oito arquivos direcionais. W usa a vista SW e NE usa a vista de perfil mais próxima. |
| walk | Passada e apoio intercalados a 5 fps. S tem duas passadas da referência. NE e NW usam as passadas mais próximas disponíveis. |
| shoot | Poses laterais E e W, com clarão separado para todas as direções. |
| damage | Duas poses frontais de reação. |
| death | Seis poses de queda, com retenção do último quadro. |
| effects | Clarão, projétil, rastro, impacto e partícula. |

A folha não traz uma sequência identificável de recarga nem poses de
disparo distintas para todas as direções. O disparo nas outras
orientações usa o efeito do clarão sobre a pose da mira.

O sprite acompanha a direção do movimento durante a caminhada e o dash.
Em repouso, mantém a última orientação. Durante o disparo, usa a direção
da mira no instante do tiro.
