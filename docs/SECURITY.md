# Segurança — Critérios para Consumo de Serviços

## Modelo de Autenticação

- **JWT Bearer Token** emitido pelo endpoint `POST /auth/token`
- Payload: `{ sub, merchantId, scopes }`
- Expiração: 24h (configurável)
- Secret via variável `JWT_SECRET` (nunca commitar)

## Autorização (Scopes)

| Scope | Permissão |
|-------|-----------|
| `entries:write` | Criar lançamentos |
| `entries:read` | Listar/consultar lançamentos |
| `balance:read` | Consultar saldo consolidado |

Guards no gateway validam scope antes de encaminhar ao backend.

## Comunicação Gateway → Backend

Headers propagados:
- `x-merchant-id` — tenant isolation
- `x-correlation-id` — rastreabilidade
- `x-user-id` — auditoria

**Produção:** adicionar mTLS ou API key interna entre gateway e serviços.

## Proteções Implementadas

| Controle | Implementação |
|----------|---------------|
| HTTPS | Terminação no ALB/Ingress (prod) |
| Helmet | Headers de segurança no gateway |
| Rate Limit | 100 req/min global; 55 req/s consolidado |
| Input Validation | class-validator nos DTOs |
| SQL Injection | Queries parametrizadas (pg) |
| Tenant Isolation | merchantId do JWT, nunca do body |

## Critérios para Integração Externa (API Consumers)

1. Obter token via `/auth/token` (prod: OAuth2/OIDC)
2. Incluir `Authorization: Bearer <token>`
3. Respeitar rate limits (429 Too Many Requests)
4. Usar `x-correlation-id` para suporte/debug
5. Tratar 503 do consolidado sem bloquear lançamentos

## Auditoria

Logs estruturados devem incluir:
- correlationId
- merchantId
- userId (sub)
- operação (create_entry, get_balance)
- timestamp ISO8601

## Evoluções Recomendadas

- OAuth2/OIDC com identity provider corporativo
- Token revocation (Redis blacklist)
- WAF na borda
- Criptografia at-rest no RDS
- Secrets Manager para JWT_SECRET
