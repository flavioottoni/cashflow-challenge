# ADR-003: PostgreSQL com Schemas Separados

## Status
Aceito

## Contexto
Dois bounded contexts (Ledger e Reporting) com modelos de dados distintos.

## Decisão
PostgreSQL único com schemas `ledger` e `reporting`.

## Consequências
- Simplicidade para o desafio/MVP
- ACID no write path
- Migração futura para DBs separados facilitada por schema isolation

## Alternativas
- MongoDB: menos adequado para transações financeiras ACID
- Dois PostgreSQL: over-engineering para MVP
