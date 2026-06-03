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

## Correção PC — animações estáticas

Nesta versão as animações do desktop foram corrigidas para não dependerem do `prefers-reduced-motion` do sistema operacional. Antes, se o Windows/navegador estivesse com redução de movimento ativada, o CSS desligava tudo e o site parecia parado no PC.

Mudanças aplicadas:
- Motion ligado por padrão com `html.motion-on`.
- `?motion=off` continua disponível caso você queira modo sem animações.
- JS com `sessionStorage` blindado para não quebrar o script inteiro.
- Fallback para revelar seções mesmo se o `IntersectionObserver` falhar.
- Camada extra `desktop-fx` com partículas leves no PC.
- Reforço CSS com `!important` nas animações principais do desktop.
- Script pequeno no `<head>` para ativar animação antes do CSS carregar.

Para testar no PC:
1. Suba todos os arquivos da pasta mantendo os nomes `index.html`, `style.css`, `script.js` e `gallery-data.js`.
2. Limpe cache do navegador com Ctrl + F5.
3. Confirme que a URL não está com `?motion=off`.


## Atualização — previews suaves e otimizadas

- Removido o visual de preview low-FPS baseado em troca de thumbnails.
- Agora os cards de vídeo usam preview real e suave do YouTube em iframe mudo.
- Os players são carregados de forma preguiçosa: só quando o card aparece na tela, recebe hover ou foco.
- O site limita a quantidade de previews ativas ao mesmo tempo para não travar: até 4 no desktop e 1 no mobile.
- Em conexão lenta, modo economia de dados ou `?motion=off`, o site volta para thumbnail estática otimizada.
- O vídeo completo ainda abre no lightbox somente ao clicar, com autoplay.
