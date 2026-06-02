COMO USAR ESTA VERSÃO

1. Suba estes arquivos no seu site:
   - index.html
   - style.css
   - script.js
   - gallery-data.js
   - videos.txt
   - build_portfolio.py
   - robots.txt
   - sitemap.xml

2. Vídeos:
   - Edite o arquivo videos.txt.
   - Coloque 1 link do YouTube por linha.
   - A ordem do txt será a ordem do site.
   - Depois rode:
     python build_portfolio.py

3. Designs:
   - Coloque qualquer imagem nova na pasta imagens.
   - Ela entra automaticamente como design quando você roda:
     python build_portfolio.py
   - A foto pessoal NÃO entra se o nome estiver na lista EXCLUDED_IMAGES no build_portfolio.py.
   - A foto atual excluída é: 20260430_194126.png
   - O preview social excluído é: preview-card.png

4. Preview para redes sociais:
   - Crie uma imagem em imagens/preview-card.png
   - Tamanho recomendado: 1200x630
   - Ela aparece quando você manda o link no WhatsApp, Discord, X, LinkedIn etc.

5. Google:
   - Troque https://gaojoia.com/ pelo domínio real se for outro.
   - Suba robots.txt e sitemap.xml na raiz.
   - Cadastre o site no Google Search Console.
   - Envie o sitemap: /sitemap.xml

6. Idiomas:
   - O botão 🇺🇸 / 🇧🇷 troca o site inteiro entre inglês e PT-BR.
   - O site começa em inglês para focar na gringa.
