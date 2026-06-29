# Estimativa de Custos — Infraestrutura e Licenças

> Valores aproximados em USD/mês — região AWS sa-east-1 (São Paulo), carga moderada.

## Ambiente de Desenvolvimento

| Item | Especificação | Custo/mês |
|------|---------------|-----------|
| ECS Fargate | 2 tasks (0.25 vCPU, 0.5 GB) | ~$15 |
| RDS PostgreSQL | db.t4g.micro | ~$15 |
| ElastiCache Redis | cache.t4g.micro | ~$12 |
| Amazon MQ RabbitMQ | mq.t3.micro (single) | ~$18 |
| ALB | 1 load balancer | ~$18 |
| CloudWatch | Logs + métricas básicas | ~$10 |
| **Total Dev** | | **~$88/mês** |

## Ambiente de Produção (50 req/s pico)

| Item | Especificação | Custo/mês |
|------|---------------|-----------|
| ECS Fargate — Gateway | 2 tasks (0.5 vCPU, 1 GB) | ~$30 |
| ECS Fargate — Entries | 2 tasks (0.5 vCPU, 1 GB) | ~$30 |
| ECS Fargate — Consolidated | 3 tasks (0.5 vCPU, 1 GB) | ~$45 |
| RDS PostgreSQL | db.t4g.small, Multi-AZ | ~$55 |
| ElastiCache Redis | cache.t4g.small, 1 replica | ~$35 |
| Amazon MQ RabbitMQ | mq.m5.large (cluster) | ~$120 |
| ALB | 1 LB + data transfer | ~$25 |
| CloudWatch + alarms | Logs, dashboards, 10 alarms | ~$25 |
| Secrets Manager | 3 secrets | ~$1 |
| **Total Prod** | | **~$366/mês** |

## Licenças de Software

| Software | Licença | Custo |
|----------|---------|-------|
| NestJS | MIT | $0 |
| PostgreSQL | PostgreSQL License | $0 |
| Redis | BSD | $0 |
| RabbitMQ | MPL 2.0 | $0 |
| Node.js | MIT | $0 |
| Prometheus/Grafana | OSS | $0 (self-hosted) |

**Total licenças: $0** — stack 100% open-source.

## Otimizações de Custo

1. Consolidated em spot instances para workloads tolerantes
2. RDS Reserved Instances (1 ano): ~30% economia
3. Redis serverless (ElastiCache Serverless) para carga variável
4. RabbitMQ → Amazon SQS + SNS para menor custo operacional (trade-off features)

## Projeção Anual Prod

~$4.400/ano infra + $0 licenças (sem suporte enterprise).
