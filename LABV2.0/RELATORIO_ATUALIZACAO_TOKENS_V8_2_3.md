# Relatório de atualização — IARA DS 8.2.3

## Problema reproduzido

A captura mostrou saldo igual a zero. O código anterior possuía um valor padrão, mas a função de leitura convertia a ausência da chave no localStorage com `Number(null)`, produzindo `0`. Como zero era considerado válido, o valor padrão nunca era aplicado.

## Correção

Foi criado `public/lab/assistants/iara/js/token-policy.js`.

A política agora:

1. diferencia chave inexistente de saldo zero;
2. inicia perfis novos com 500 tokens;
3. migra uma vez instalações antigas com saldo zero para 500;
4. preserva qualquer saldo positivo já existente;
5. registra a migração em `labds.iara.v8.initial500`;
6. limita o saldo total a 1.000.000 de tokens.

## Recargas

Os códigos são normalizados em maiúsculas e comparados por SHA-256 com um prefixo interno. O arquivo público guarda somente os hashes e valores.

- AGV: +1.000;
- DS: +500;
- AURA: +50.000.

Cada hash é registrado em `labds.iara.v8.codes` após uso e não pode ser ativado novamente no mesmo perfil de navegador.

## Limitação front-end

Como o GitHub Pages não possui servidor, o controle de uso único é local. Limpar os dados do site, usar outro navegador ou outro aparelho reinicia esse controle. Os tokens não têm valor financeiro e são somente uma simulação pedagógica.

## Correção adicional

O botão inicial “Abrir VoxelCraft” passou a usar uma lista interna segura de ferramentas essenciais. Assim, ele continua funcionando mesmo quando o catálogo contextual da IARA não é carregado integralmente.
