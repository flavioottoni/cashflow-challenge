# Observabilidade e Monitoramento

## Pilares

### Logs
- Formato JSON recomendado (NestJS Logger)
- Campos obrigatórios: `service`, `correlationId`, `merchantId`, `level`, `message`
- Middleware `x-correlation-id` em todos os serviços

### Métricas (Prometheus)

| Métrica | Tipo | Serviço |
|---------|------|---------|
| `http_requests_total` | Counter | entries, consolidated |
| `http_request_duration_seconds` | Histogram | entries, consolidated |
| `cache_hit_ratio` | Gauge | consolidated |
| Default Node metrics | Gauge/Counter | todos |

Endpoint: `GET /metrics` em cada serviço.

### Health Checks

| Endpoint | Propósito |
|----------|-----------|
| `/health` | Liveness — processo vivo |
| `/ready` | Readiness — DB conectado |

Gateway `/ready` reporta status de entries e consolidated separadamente.

## SLOs e Alertas Sugeridos

| Alerta | Condição | Severidade |
|--------|----------|------------|
| EntriesDown | `/health` fail > 1min | Critical |
| ConsolidatedHighErrorRate | error rate > 5% em 5min | Warning |
| QueueLagHigh | outbox ou MQ lag > 1000 msgs | Warning |
| CacheHitLow | cache_hit_ratio < 0.7 | Info |

## Dashboard Grafana (sugerido)

Painéis:
1. Request rate por serviço
2. Latência p50/p95/p99
3. Error rate consolidado
4. Cache hit ratio
5. RabbitMQ queue depth

## Tracing (Evolução)

OpenTelemetry pode ser adicionado propagando `traceparent` junto ao `correlation-id`. Spans sugeridos:
- gateway.proxy
- entries.create
- outbox.publish
- consolidated.consume
- consolidated.getBalance

## Runbook — Consolidado Indisponível

1. Verificar `/ready` do consolidated-service
2. Lançamentos continuam via gateway → entries
3. Eventos acumulam no RabbitMQ
4. Ao restaurar consolidated, consumer processa backlog
5. Validar paridade saldo vs somatório de lançamentos
