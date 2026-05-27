# Checklist de produção

## Ambiente
- Configurar `DATABASE_URL` com Neon em produção.
- Configurar `AUTH_SECRET` forte e diferente do ambiente local.
- Configurar `OPENAI_API_KEY` apenas se a geração de descrição com IA for usada.
- Confirmar `VITE_API_URL` apontando para a API correta quando front e API estiverem separados.

## Operação
- Criar usuário admin real e trocar/remover senha padrão.
- Validar cadastro, login, carrinho, checkout e pedido no admin.
- Confirmar que produtos, pedidos e vitrine estão persistindo no Neon.
- Testar alteração de status e observações internas do pedido.

## Loja
- Revisar páginas institucionais: privacidade, termos, trocas, entrega e garantia.
- Revisar textos de prazo, entrega combinada e retirada.
- Testar URLs de produto em `/produto/{slug}`.
- Conferir mobile em celular real.

## Segurança
- Não commitar dados reais em `apps/api/src/data/*.json`.
- Não expor chaves no frontend.
- Usar HTTPS no domínio final.
- Revisar permissões de admin antes de liberar painel.

## Próximo bloco
- Integrar gateway de pagamento.
- Adicionar webhooks de pagamento.
- Automatizar mudança de status financeiro.
