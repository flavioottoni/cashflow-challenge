# ADR-005: Redis Cache-Aside no Consolidado

## Status
Aceito

## Contexto
Meta de 50 req/s no GET de saldo diário com p95 < 100ms.

## Decisão
Cache-aside com Redis, TTL 30s, invalidação/atualização no consumer.

## Consequências
- Redução drástica de queries ao PostgreSQL
- Possível staleness de até 30s em cache hit (aceitável para relatório diário)
- Métrica `cache_hit_ratio` exposta
