# Módulos do Lab Virtual DS

Cada laboratório possui uma pasta independente:

```text
modules/<nome-do-modulo>/
├── module.json   # peso, versão, dependências, scripts e estilos
├── index.js      # controlador e interface do laboratório
├── styles.css    # opcional; carregado somente junto do módulo
└── runtime/      # opcional; motores, dados ou componentes internos
```

O `ResourceLoader` consulta o manifesto apenas quando a ferramenta é aberta. Não inclua laboratórios no HTML principal nem na lista `CORE_FILES` do Service Worker.

O Cyber Ops utiliza duas pastas: `cyber-ops-lab` contém o adaptador do Lab Virtual DS e `cyber-ops` contém a aplicação isolada Shadow Grid.
