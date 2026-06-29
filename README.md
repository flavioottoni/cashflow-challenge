# Cashflow Challenge — Controle de Fluxo de Caixa

Desafio técnico para **Arquiteto de Soluções**: sistema de controle de fluxo de caixa com lançamentos (débitos/créditos) e saldo diário consolidado.

**Repositório:** https://github.com/flavioottoni/cashflow-challenge

## Decisões Arquiteturais Principais

- **Microsserviços + CQRS + Event-Driven Architecture (EDA)**
- Write path (`entries-service`) desacoplado do read path (`consolidated-service`)
- **Outbox Pattern** + RabbitMQ para garantir entrega de eventos
- **Redis cache-aside** no consolidado para atender 50 req/s
- **API Gateway** com JWT, scopes e rate limiting

Documentação completa em [`docs/`](docs/):

| Documento | Conteúdo |
|-----------|----------|
| [REQUIREMENTS.md](docs/REQUIREMENTS.md) | RF/RNF refinados |
| [DOMAIN.md](docs/DOMAIN.md) | Domínios e capacidades |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitetura alvo (C4) |
| [SECURITY.md](docs/SECURITY.md) | Critérios de segurança |
| [OBSERVABILITY.md](docs/OBSERVABILITY.md) | Monitoramento |
| [TRANSITION.md](docs/TRANSITION.md) | Migração de legado |
| [COSTS.md](docs/COSTS.md) | Estimativa de infra |
| [FUTURE.md](docs/FUTURE.md) | Roadmap |

## Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- (Opcional) [k6](https://k6.io/) para load test

## Execução Local

### 1. Subir infraestrutura e serviços

```bash
cd docker
docker compose up -d --build
```

Serviços disponíveis:

| Serviço | URL |
|---------|-----|
| API Gateway | http://localhost:3000 |
| Entries Service | http://localhost:3001 |
| Consolidated Service | http://localhost:3002 |
| RabbitMQ Management | http://localhost:15672 (cashflow/cashflow) |

### 2. Obter token JWT

```bash
curl -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"merchantId":"merchant-001","username":"demo"}'
```

### 3. Criar lançamento (crédito)

```bash
TOKEN="<seu-token>"

curl -X POST http://localhost:3000/entries \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CREDIT",
    "amount": 500.00,
    "description": "Venda balcão",
    "date": "2026-06-29"
  }'
```

### 4. Criar lançamento (débito)

```bash
curl -X POST http://localhost:3000/entries \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "DEBIT",
    "amount": 150.00,
    "description": "Compra insumos",
    "date": "2026-06-29"
  }'
```

### 5. Consultar saldo consolidado

Aguarde ~5s para projeção via outbox + consumer, então:

```bash
curl "http://localhost:3000/daily-balance?date=2026-06-29" \
  -H "Authorization: Bearer $TOKEN"
```

Resposta esperada:

```json
{
  "date": "2026-06-29",
  "merchantId": "merchant-001",
  "totalCredits": 500,
  "totalDebits": 150,
  "balance": 350,
  "computedAt": "2026-06-29T..."
}
```

## Desenvolvimento (sem Docker para apps)

```bash
# Terminal 1 — infra
cd docker && docker compose up postgres redis rabbitmq -d

# Terminal 2 — instalar e buildar
npm install
npm run build -w @cashflow/shared

# Terminais separados
npm run start:entries
npm run start:consolidated
npm run start:gateway
```

## Testes

```bash
# Unitários (todos os serviços)
npm test

# E2E resiliência (entries sem consolidated)
npm run test:e2e -w entries-service

# Testes de arquitetura
npx jest --config jest.config.js

# Load test (requer stack up + k6)
npm run load-test
```

## Health e Métricas

```bash
curl http://localhost:3000/health
curl http://localhost:3000/ready
curl http://localhost:3001/metrics
curl http://localhost:3002/metrics
```

## Estrutura do Projeto

```
├── apps/
│   ├── api-gateway/          # JWT, routing, rate limit
│   ├── entries-service/        # Lançamentos (write)
│   └── consolidated-service/   # Saldo diário (read)
├── libs/shared/                # DTOs, eventos, utilitários
├── docs/                       # Documentação arquitetural
├── docker/                     # Docker Compose + init SQL
└── tests/                      # Load test + testes de arquitetura
```

## Atendimento aos Requisitos

| Requisito | Status |
|-----------|--------|
| Serviço de lançamentos | ✅ |
| Serviço consolidado diário | ✅ |
| Domínios e capacidades | ✅ [DOMAIN.md](docs/DOMAIN.md) |
| RF/RNF refinados | ✅ [REQUIREMENTS.md](docs/REQUIREMENTS.md) |
| Arquitetura alvo | ✅ [ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Justificativa tecnológica | ✅ ADRs em docs/ADR/ |
| Testes | ✅ Unit + E2E + arquitetura + k6 |
| Lançamentos up se consolidado down | ✅ EDA + Outbox |
| 50 req/s consolidado | ✅ Cache + rate limit + k6 |
| Observabilidade | ✅ Metrics + health |
| Segurança | ✅ JWT + scopes |
| Transição / Custos | ✅ docs diferenciais |

## Licença

MIT
