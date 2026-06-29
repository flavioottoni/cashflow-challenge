# Evoluções Futuras

Itens que demonstram visão de produto além do escopo do desafio:

## Curto Prazo

- [ ] **Idempotency-Key** no POST /entries — evitar duplicatas em retry
- [ ] **OpenTelemetry** completo com Jaeger/Tempo
- [ ] **Swagger unificado** no gateway agregando specs dos backends
- [ ] **Migrations** com TypeORM ou Prisma migrate

## Médio Prazo

- [ ] **Multi-loja / multi-tenant** — merchant com filiais
- [ ] **Estorno (reversal)** — saga compensatória
- [ ] **Relatório mensal/anual** — projeções adicionais + export CSV/PDF
- [ ] **Webhook** — notificar sistemas externos quando saldo muda
- [ ] **OAuth2/OIDC** — integração com IdP corporativo

## Longo Prazo

- [ ] **Conciliação bancária** — Open Banking Brasil
- [ ] **Event Sourcing** completo no ledger — audit trail imutável
- [ ] **Data Warehouse** — BigQuery/Snowflake para analytics
- [ ] **GraphQL Federation** no gateway
- [ ] **Multi-region** — DR e latência global

## Limitações Conhecidas do MVP

1. Token JWT via endpoint demo (não produção)
2. Outbox polling a cada 5s (latência mínima de projeção)
3. PostgreSQL compartilhado entre contextos
4. Sem idempotência explícita
5. Load test requer k6 instalado localmente

## Contribuições Bem-vindas

Issues e PRs para itens acima são encorajados após entrega do desafio.
