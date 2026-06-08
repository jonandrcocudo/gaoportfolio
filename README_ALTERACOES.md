# Alterações — versão focada em vídeo, venda e categorias reais

## Estratégia de venda aplicada
- O vídeo avulso aparece como entrada de baixo risco: **from $29+ / video**.
- Os preços ficam estampados nos cards para o cliente não precisar procurar valor.
- Pacote mensal usa ancoragem: mostra o valor separado e o custo menor por vídeo.
- Projetos complexos usam CTA direto para orçamento personalizado no WhatsApp.
- A página prioriza prova visual primeiro: vídeos aparecem antes de design e antes de explicações longas.

## Vídeos categorizados com base na lista enviada
A vitrine principal agora usa nomes reais e descrição de habilidade para cada URL:
- **Best Edit — Horror Games Video Essay**: video essay PT-BR com 3D, VFX, motion e retenção.
- **Purple Guy FNAF**: pixel art + 3D + After Effects.
- **KinitoPET Lore**: TikTok/lore com 3D, VFX e VRChat.
- **Death Note**: motion manga.
- **It's Been So Long**: motion + pixel art.
- **Rentune / Fears to Fathom**: narrativa de jogo.
- **agoodgamer / Mouse PI For Hire**: YouTube gaming/platinum.
- **Backrooms: Escape Together**: gameplay/horror.
- **Quest 2 VR**: TikTok tech/VR.
- **WoW Corrupted Blood**: TikTok lore/explainer.
- **Reflective Story Video**: edição narrativa limpa.

## Filtros de vídeo
- All videos
- Best proof
- TikTok/Shorts
- Video essays/lore
- Gaming
- Motion/3D/VFX

Um vídeo pode aparecer em mais de uma categoria. Exemplo: o vídeo de terror entra em Featured, YouTube, Essay, Gaming e Motion.

## Design separado por função
As imagens foram separadas pela função que vendem:
- **Thumbnail**: imagens 16:9 feitas para clique.
- **Cover / Social**: capas e artes quadradas.
- **Identity / Character**: avatar, personagem, mascote e identidade de criador.
- **Brand / Graphic**: logo, banner, ícone e title card.

## Performance
- Mantido o carregamento lazy para galeria.
- Thumbnails do YouTube usam `maxresdefault` com fallback para `hqdefault`.
- Previews em vídeo continuam carregando só quando visíveis/hover, com limite de iframes ativos.
- Imagens do portfólio continuam otimizadas em WebP com fallback para PNG.

## Arquivos principais editados
- `index.html`
- `style.css`
- `script.js`
- `gallery-data.js`
- `videos.txt`
- `build_portfolio.py`
- `atualizar_gallery.py`
