# Guia de testes da V4.0

## Validação automática

Na raiz do projeto:

```bash
node tools/validate-project.mjs
node tools/test-module-registration.mjs
```

O resultado esperado é `status: ok`, `tools: 51`, `modules: 42` e `registered: 42`.

## Execução local correta

Módulos ES, workers, IndexedDB e Service Worker exigem HTTP. Não abra `lab/index.html` diretamente por `file://`.

```bash
python -m http.server 8080
```

Abra `http://localhost:8080/lab/`.

## Teste crítico do VoxelCraft

1. Abra “VoxelCraft DS 3D”.
2. Confirme “VoxelCraft pronto para jogar”.
3. Escolha Automático e “Novo mundo”.
4. Verifique terreno 3D, água, nuvens, árvores, animais, HUD e mira.
5. Use WASD/setas, mouse, Espaço, Shift e C.
6. Quebre com clique esquerdo e construa com clique direito.
7. Troque itens, abra inventário e alterne a câmera.
8. Salve, volte ao menu, recarregue e use “Continuar”.
9. Repita em Baixo, Médio, Alto e Ultra.
10. No celular, teste os dois joysticks e os cinco botões de ação.
11. No painel de rede do navegador, confirme que Three.js vem de `lab/vendor/three/`, não de CDN.

## Regressões prioritárias

- Gráficos: alfa 0–1, borracha, conta-gotas, desfazer/refazer e PNG transparente.
- VM: país/região, avanço, Cancelar, boot, instalação e área de trabalho.
- Terminais: comando, histórico, sistema de arquivos, redes e troca de shell.
- Python/SQL: carregamento, execução, erro e reinício.
- Cyber Ops: abrir, iniciar missão, concluir etapa, salvar e exportar.
- 17 ferramentas restauradas: abrir e acionar a função principal de cada uma.

## Navegadores e dispositivos

Executar no mínimo em Chrome/Edge desktop e Android/Chromebook. Firefox é recomendado. Recursos de câmera, microfone, sensores, áudio e tela cheia dependem de HTTPS ou localhost e permissão explícita.
