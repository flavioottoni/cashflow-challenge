# ADR-001: Microsserviços com CQRS e Event-Driven Architecture

## Status
Aceito

## Contexto
O desafio exige que o serviço de lançamentos permaneça disponível mesmo se o consolidado diário cair. Em dias de pico, o consolidado deve suportar 50 req/s com no máximo 5% de perda.

## Decisão
Adotar arquitetura de microsserviços com:
- **entries-service** para escrita (Command side)
- **consolidated-service** para leitura (Query side)
- Comunicação assíncrona via RabbitMQ (evento `entry.created`)
- Padrão Outbox para garantia de entrega

## Consequências
- Consistência eventual entre lançamento e saldo consolidado
- Maior complexidade operacional (fila, múltiplos serviços)
- Escala independente do read path
- Isolamento de falha conforme RNF

## Alternativas Consideradas
- **Monolito modular:** rejeitado — compartilha runtime; falha no consolidado poderia impactar lançamentos
- **Serverless:** rejeitado — cold start e menor controle de SLA para 50 req/s
