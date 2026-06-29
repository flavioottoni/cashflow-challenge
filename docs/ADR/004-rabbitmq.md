# ADR-004: RabbitMQ para Integração Assíncrona

## Status
Aceito

## Contexto
Desacoplamento entre lançamentos e consolidado; fila durável quando consumer indisponível.

## Decisão
RabbitMQ com exchange topic `cashflow.entries` e routing key `entry.created`.

## Consequências
- Mensagens persistidas em disco
- DLQ configurável para poison messages
- Infraestrutura adicional vs Redis Streams

## Alternativas
- Redis Streams: menor durabilidade operacional
- Kafka: overkill para volume do desafio
