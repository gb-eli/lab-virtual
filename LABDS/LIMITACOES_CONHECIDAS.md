# Limitações conhecidas

- O ambiente desta consolidação não possuía Chromium/Chrome executável; testes visuais automatizados completos não foram realizados aqui.
- Python, SQL WebAssembly, câmera, microfone, sensores, áudio, pointer lock, tela cheia e PWA dependem das permissões e políticas do navegador.
- Selecionar Ultra manualmente pode reduzir FPS em aparelhos fracos; o sistema não remove essa opção.
- O navegador não permite escolher diretamente a GPU integrada ou dedicada. Essa preferência deve ser configurada no sistema operacional; o portal pode medir capacidades, mas não trocar a GPU por API web.
- Service Workers não funcionam via `file://`; use GitHub Pages ou servidor local.
- A validação estrutural não substitui o roteiro visual e funcional em equipamento escolar real.
