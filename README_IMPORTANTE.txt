VERSÃO SEM PREÇOS PÚBLICOS + SEO + CONVERSÃO

O que foi atualizado agora:
- Removi a aba/seção de valores públicos e todos os valores diretos do site.
- O portfólio agora vende pela prova visual, categorias, estilo, escopo e canais de contato.
- Cards de vídeo e design não exibem mais valores.
- FAQ, hero, modal de contato, metadados SEO e JSON-LD foram limpos para não mostrar tabela ou valores.
- As mensagens de WhatsApp/Email pedem plataforma, duração, quantidade, prazo, referências e observações de escopo, sem campo de valor público.
- Os scripts build_portfolio.py e atualizar_gallery.py também foram ajustados para não regenerar campos de valor numérico.

Como instalar:
1. Suba todos os arquivos mantendo a estrutura de pastas.
2. No Vercel, faça deploy da pasta raiz onde está index.html.
3. Depois do deploy, abra o site e faça Ctrl+F5 para limpar cache.
4. Atualize o sitemap no Google Search Console se necessário.

Como atualizar imagens e vídeos:
- Coloque links do YouTube no videos.txt, um por linha.
- Coloque imagens novas dentro da pasta imagens/.
- Rode: python atualizar_gallery.py
- Se o Pillow estiver instalado, o script gera WebP automaticamente em imagens/optimized/.
