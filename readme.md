# Sistema de Pagamento e Notificação

Este projeto consiste em dois serviços:

1. **Serviço de Pagamento**: Gera transações e envia mensagens para o RabbitMQ.
2. **Serviço de Notificação**: Escuta a fila de transações e notifica o cliente quando uma nova transação é recebida.

## Requisitos

- Docker Compose
- Postgres
- Node

## Estrutura do Projeto

```plaintext
.
├── payment-service
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
├── notification-service
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
└── docker-compose.yml
```

## Como Executar

Siga as etapas abaixo para executar o sistema completo usando Docker Compose.

1. **Clone este repositório** para seu ambiente local:

```bash
git clone https://github.com/usuario/sistema-pagamento-notificacao.git
```

2. Execute o Docker Compose para iniciar os serviços:

```bash

docker-compose up --build

```

3. Verifique os serviços:
- RabbitMQ Management: http://localhost:15672
- Serviço de Pagamento:  http://localhost:8001
- Serviço de Notificação:  http://localhost:8002

## Endpoints

1. Realizar Transação:

POST:  http://localhost:8001/transaction


Body de Requisição:
```
{
    userId: 1, 
    amount: 100
}
```

2. Aprovar Transação:

PUT: http://localhost:8001/transactions/:id/success

3. Leitura de Notificação
GET: http://localhost:8002/notification


## Encerrar Sessão

2. Execute o Docker Compose para encerrar os serviços:

```bash

docker-compose down

```
