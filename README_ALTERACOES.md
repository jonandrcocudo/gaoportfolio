# Gao Site — versão impecável desktop/mobile

Arquivos principais:
- index.html
- style.css
- script.js
- gallery-data.js
- videos.txt
- robots.txt
- sitemap.xml

O que foi melhorado:
- Layout desktop mais premium, com hero em shell/glass, grid melhor e largura controlada.
- Mobile mantido responsivo e leve.
- Animações mais suaves usando principalmente transform, opacity e CSS variables.
- Cards de portfólio mais bonitos, com previews low-FPS para YouTube.
- Lightbox com autoplay apenas ao clicar, mantendo performance.
- SEO reforçado com title/description melhores, hreflang, robots avançado, Open Graph, Twitter Cards e JSON-LD para WebSite, Person/ProfessionalService, ofertas e FAQ.
- Conteúdo mais vendedor: copy de conversão, pacotes claros, prova, processo, FAQ e CTA com briefing.

Como instalar:
1. Substitua index.html, style.css, script.js e gallery-data.js no servidor.
2. Mantenha sua pasta imagens/ no mesmo nível do index.html.
3. Edite videos.txt para mudar a ordem dos vídeos, depois gere/atualize gallery-data.js se seu fluxo já faz isso.
4. Envie robots.txt e sitemap.xml para a raiz do domínio.

Atualizar vídeos e imagens automaticamente:
- Coloque os links no videos.txt, um por linha.
- Coloque imagens novas dentro da pasta imagens/.
- Rode: `python atualizar_gallery.py`
- O arquivo gallery-data.js será recriado com a ordem correta dos vídeos e todas as imagens encontradas.
