GAO PORTFOLIO — VERSÃO ENXUTA E RESPONSIVA

Estrutura:
- Abertura direta com acesso imediato aos trabalhos.
- Galeria de vídeos e projetos visuais com filtros.
- Serviços resumidos em três categorias.
- Sobre, canais de contato e briefing.

Idioma:
- Inglês como padrão.
- Botão EN/PT para alternar entre inglês e português.
- A escolha fica salva no navegador.

Desempenho:
- Prévia de vídeo do YouTube apenas ao passar o mouse ou focar o card no desktop.
- No celular, os cards usam thumbnails; o vídeo abre após o toque.
- Conexões lentas e modo de economia de dados também ficam em modo thumbnail.
- Animações decorativas reduzidas e preferência de movimento do sistema respeitada.
- Imagens da galeria usam WebP em imagens/optimized/.

Deploy:
1. Publique a pasta raiz no Vercel.
2. A página inicial é index.html.
3. Após mudanças, atualize a página com Ctrl+F5 caso o navegador mantenha cache antigo.

Atualizar a galeria:
- Adicione links do YouTube em videos.txt.
- Adicione imagens em imagens/.
- Rode python atualizar_gallery.py.
- Com Pillow instalado, o script gera versões WebP em imagens/optimized/.
