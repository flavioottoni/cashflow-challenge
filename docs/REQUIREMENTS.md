# Requisitos — Controle de Fluxo de Caixa

## Persona

**Comerciante (Merchant):** pequeno ou médio empresário que precisa registrar entradas e saídas diárias e consultar o saldo consolidado do dia para tomada de decisão operacional.

## Requisitos de Negócio (originais)

| ID | Requisito |
|----|-----------|
| RN-01 | Controlar fluxo de caixa diário com lançamentos (débitos e créditos) |
| RN-02 | Disponibilizar relatório com saldo diário consolidado |

## Requisitos Funcionais Refinados

### Serviço de Lançamentos (`entries-service`)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-01 | Criar lançamento com tipo DEBIT ou CREDIT, valor, data e descrição | Must |
| RF-02 | Listar lançamentos por comerciante, com filtro opcional por data | Must |
| RF-03 | Consultar lançamento por ID | Must |
| RF-04 | Validar valor > 0 e tipo válido | Must |
| RF-05 | Rejeitar data futura | Should |
| RF-06 | Publicar evento `entry.created` após persistência (outbox) | Must |

### Serviço de Consolidado Diário (`consolidated-service`)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-07 | Consumir eventos de lançamento e atualizar projeção diária | Must |
| RF-08 | Consultar saldo diário (créditos, débitos, saldo) | Must |
| RF-09 | Consultar saldos em intervalo de datas | Could |
| RF-10 | Retornar saldo zero quando não há lançamentos no dia | Must |

### API Gateway

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-11 | Autenticação JWT com scopes | Must |
| RF-12 | Roteamento para serviços backend | Must |
| RF-13 | Rate limit no endpoint de consolidado | Must |

## Casos de Uso

### UC-01 — Registrar venda (crédito)

1. Comerciante autentica-se no gateway
2. Envia POST `/entries` com type=CREDIT
3. Sistema persiste lançamento e enfileira evento
4. Consolidado atualiza saldo de forma assíncrona

### UC-02 — Registrar despesa (débito)

1. Comerciante autentica-se
2. Envia POST `/entries` com type=DEBIT
3. Saldo consolidado é decrementado após processamento do evento

### UC-03 — Consultar saldo do dia

1. Comerciante autentica-se
2. Envia GET `/daily-balance?date=YYYY-MM-DD`
3. Sistema retorna totais pré-computados (cache Redis quando disponível)

## Requisitos Não Funcionais

| ID | Requisito | Meta | Medição |
|----|-----------|------|---------|
| RNF-01 | **Isolamento de falha** | Lançamentos disponível se consolidado cair | Teste de integração + arquitetura EDA |
| RNF-02 | **Throughput consolidado** | 50 req/s pico; ≤5% perda | k6 load test |
| RNF-03 | Latência lançamento | p95 < 300ms | Prometheus histogram |
| RNF-04 | Latência consolidado (cache hit) | p95 < 100ms | Prometheus + Redis |
| RNF-05 | Disponibilidade lançamentos | 99.9% SLA | Health checks + redundância |
| RNF-06 | Consistência | Eventual (< 5s normal) | Lag de fila monitorado |
| RNF-07 | Segurança | Auth obrigatória; scopes | JWT + gateway |
| RNF-08 | Observabilidade | Traces, métricas, logs | OpenTelemetry/Prometheus |
| RNF-09 | Auditabilidade | Log estruturado por operação | correlation-id |

## SLAs e SLOs

- **Entries Service:** error rate < 0.1%, availability 99.9%
- **Consolidated Service:** error rate ≤ 5% em pico de 50 req/s
- **Event lag:** p95 < 5 segundos entre criação e projeção

## Restrições

- Repositório público no GitHub
- Documentação completa no repositório
- Testes automatizados
- README com instruções de execução local
