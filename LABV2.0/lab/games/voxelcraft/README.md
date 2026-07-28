# VoxelCraft DS 3D — integração 9

Jogo voxel educacional integrado ao Laboratório Virtual DS 8.1.

## Modos

- **Aprendizagem:** missões, explicações e trechos de lógica.
- **Livre:** exploração sem objetivo obrigatório.
- **Desafio:** metas maiores e XP ampliado.

## Qualidade

- Baixo: celular básico;
- Médio: Chromebook/tablet;
- Alto: notebook/PC;
- Ultra: computador potente;
- Automático: decisão por memória, núcleos e tipo de ponteiro.

Em aparelhos de toque, limites adicionais são aplicados mesmo quando o usuário seleciona perfil elevado.

## Controles

- computador: WASD/setas, mouse, Espaço, Shift, C, clique esquerdo e direito;
- celular/tablet: dois joysticks e botões Pular, Quebrar, Construir e Agachar.

## Persistência e segurança

O mundo é salvo em IndexedDB com schema validado. Coordenadas, inventário, XP e alterações são limitados antes de serem restaurados. O jogo não executa código fornecido pelo aluno e não utiliza `eval`, `new Function` ou `document.write`.

## Dependência externa

Three.js 0.180.0 é carregado do jsDelivr na primeira execução. O Service Worker do Laboratório Virtual DS tenta manter o recurso em cache depois do primeiro carregamento bem-sucedido.
