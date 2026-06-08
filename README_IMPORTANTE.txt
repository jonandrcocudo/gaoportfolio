VERSÃO VIDEO-FIRST + SEO + CONVERSÃO + CATEGORIAS REAIS

O que foi atualizado agora:
- O site foi reorganizado para vender primeiro pelo visual: vídeos aparecem antes dos serviços e com filtros por categoria.
- A lista de URLs enviada foi aplicada com títulos reais, contexto real e skills em cada card.
- O vídeo essay PT-BR sobre jogos de terror foi colocado como primeira peça/prova principal, porque concentra 3D, VFX, motion e retenção.
- Cada card de vídeo agora mostra preço estampado: "from $29 / video", "from $49 / video", "from $69 / video", "from $99 / video", etc.
- Adicionei tática de venda por ancoragem: vídeo avulso barato primeiro, pacote mensal destacado depois, personalizado como saída direta para contato.
- Valores reposicionados para parecerem mais acessíveis sem desvalorizar trabalhos complexos:
  - Vídeo avulso inicial: $29+
  - Short padrão: $39–$59
  - Motion manga / pixel art simples: $49+
  - 3D/VFX short mais pesado: $69+
  - YouTube: $99+
  - YouTube narrativo/story: $119+
  - Video essay / 3D/VFX pesado: $149+
  - Thumbnail/design: $15–$45
  - Growth mensal: $449+ / mês, com custo aproximado menor por vídeo
- Adicionei opção PERSONALIZADO que abre WhatsApp direto com briefing pronto.
- Twitter/X mantido e reforçado: @gaoeditor / https://x.com/gaoeditor.

Filtros de vídeo:
- All videos
- Best proof
- TikTok/Shorts
- Video essays/lore
- Gaming
- Motion/3D/VFX

Vídeos classificados:
- Best Edit — Horror Games Video Essay: melhor prova, YouTube, video essay, motion, gaming, 3D/VFX.
- Purple Guy FNAF: pixel art, 3D, After Effects, horror/gaming.
- KinitoPET Lore: TikTok/lore, 3D, VFX e VRChat.
- Death Note: motion manga.
- It's Been So Long: motion e pixel art.
- Rentune / Fears to Fathom: narrativa de jogo / YouTube.
- agoodgamer / Mouse PI For Hire: YouTube gaming/platinum.
- Backrooms: Escape Together: gameplay/horror.
- Quest 2 VR: TikTok tech/VR.
- WoW Corrupted Blood: TikTok lore/explainer.
- Reflective Story Video: edição narrativa limpa.

Design separado por função visual:
- Thumbnail: imagens 16:9 feitas para clique.
- Cover / Social: capas quadradas e artes de vibe/social.
- Identity / Character: avatares, personagens, mascote e identidade de criador.
- Brand / Graphic: logos, banners, title cards e assets gráficos.

Performance:
- Imagens WebP com fallback para PNG.
- Lazy loading nas imagens.
- Thumbnails do YouTube em maxresdefault com fallback.
- Previews em vídeo carregam só quando visíveis/hover e com limite de iframes ativos.
- SEO técnico reforçado: title, description, canonical, hreflang, Open Graph, Twitter Card e JSON-LD.

Como instalar:
1. Suba todos os arquivos mantendo a estrutura de pastas.
2. No Vercel, faça deploy da pasta raiz onde está index.html.
3. Depois do deploy, abra o site e faça Ctrl+F5 para limpar cache.
4. Envie/atualize sitemap.xml no Google Search Console.

Como atualizar imagens e vídeos:
- Coloque links do YouTube no videos.txt, um por linha.
- Para os 11 vídeos principais, o build_portfolio.py já tem metadados exatos por ID do YouTube.
- Coloque imagens novas dentro da pasta imagens/.
- Rode: python atualizar_gallery.py
- Se o Pillow estiver instalado, o script gera WebP automaticamente em imagens/optimized/.

Observação:
- Vídeos novos que não estiverem no mapa de metadados recebem uma categoria padrão automaticamente. Para deixá-los perfeitos, edite o VIDEO_META no build_portfolio.py/atualizar_gallery.py.
