# ADR-002: NestJS + TypeScript

## Status
Aceito

## Contexto
Necessidade de framework maduro para APIs REST, DI, testes e suporte a microserviços.

## Decisão
NestJS com TypeScript em monorepo npm workspaces.

## Consequências
- Tipagem estática reduz erros
- Swagger integrado
- Ecossistema npm amplo
- Curva de aprendizado para decorators/DI

## Alternativas
- Express puro: mais boilerplate
- Fastify: menor adoção em equipes enterprise
