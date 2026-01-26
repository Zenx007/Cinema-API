# Cinema API 

## 1. Visão Geral

API RESTful desenvolvida em **Node.js (NestJS)** para criar e gerenciar reservas de cinema

## 2. Tecnologias Escolhidas

### Banco de Dados: PostgreSQL

### Cache: Redis

### Mensageria: RabbitMQ

## 3. Como Executar

### Pré-requisitos
* **Docker** e **Docker Compose** instalados.
* Portas `10000` (API), `5432` (Postgres), `6379` (Redis) e `5672/15672` (RabbitMQ) livres.

### Comandos para subir o ambiente
O projeto é totalmente conteinerizado. Para iniciar:

```bash
# Sobe a aplicação e todos os serviços (DB, Redis, Rabbit)
docker-compose up -d --build
```

### Como popular dados iniciais e Testar Manualmente
A API possui documentação **Swagger**. Acesse:
👉 **[http://localhost:10000/api-docs](http://localhost:10000/api-docs)**

1. Use o endpoint `POST /Session` para criar uma sessão com o seguinte corpo:
    ```json
    {
      "movie": "Vingadores",
      "room": "A",
      "price": 30,
      "numberOfSeats": 20,
      "startTime": "20:00"
    }
    ```
2. Copie o ID da sessão gerada na resposta.
3. Use o endpoint `GET /Seat/GetAvailable` com o ID da sessão para ver os assentos gerados.
4. Use o endpoint `POST /Reservation` para tentar reservar um assento.
5. Passe um nome ou uuid para o usuário:
   ```json
    {
      "userId": "Maria",
      "seatId": "10e9f3a3-ddea-4648-8a23-772499f792be"
    }
   ```

### Como executar testes (Prova de Concorrência)
Foi implementado um teste **E2E (End-to-End)** que simula uma "Race Condition" real, disparando requisições paralelas contra a API.

```bash
docker exec -it cinema_api npm run test:e2e -- test/concurrency.e2e-spec.ts
````

## 4. Estratégias Implementadas

### Solução para Race Conditions (Condição de Corrida)
Utilizei **Optimistic Locking (Travamento Otimista)** com versionamento de linha.

* **Implementação:** A entidade `Seat` possui uma coluna `@VersionColumn`.
* **Funcionamento:** Ao tentar atualizar um assento para `RESERVED`, o TypeORM verifica se a versão no banco é igual à versão lida na memória. Se outro usuário tiver alterado o registro milissegundos antes, a versão não baterá e o banco rejeitará a gravação

### Coordenação entre Instâncias
A "Fonte da Verdade" (Source of Truth) é única: o **PostgreSQL**. O Redis é utilizado apenas para leitura eventual. A consistência de escrita é garantida pelo banco relacional, permitindo que múltiplas instâncias da API rodem sem conflito, desde que respeitem o versionamento do banco.

### Prevenção de Deadlocks
* As transações são curtas e atômicas.
* A ordem de atualização é consistente (sempre atualiza Assento -> Insere Reserva), evitando dependências circulares.
* O uso de *Optimistic Locking* elimina a necessidade de `SELECT ... FOR UPDATE` longos, que são a principal causa de deadlocks em sistemas tradicionais.

---

## 5. Endpoints da API

Principais endpoints (Documentação completa no Swagger):

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/Session/Create` | Cria uma nova sessão de cinema e gera os assentos automaticamente. |
| `GET` | `/Seat/GetAvailable` | Lista assentos livres (cacheado no Redis). |
| `POST` | `/Reservation/Create` | Cria uma reserva |
| `POST` | `/Reservation/ConfirmPayment` | Confirma uma reserva |
| `DELETE` | `/Session/Delete:id` | Remove uma sessão (Possui validação se há ingressos vendidos). |

---

## 6. Decisões Técnicas

* **Consumer Híbrido:** Optei por rodar o *Consumer* do RabbitMQ dentro da própria aplicação NestJS (usando `connectMicroservice`).
    * **Justificativa:** Simplifica a infraestrutura para o teste técnico (um único container) e facilita o desenvolvimento, mantendo, contudo, o desacoplamento lógico do código. Em produção, isso poderia ser extraído facilmente para um Pod/Container separado.
* **Validação Manual na Deleção:** Em vez de usar `ON DELETE CASCADE` indiscriminadamente, implementei uma verificação de lógica de negócio ("Sessão tem reservas?") antes de permitir a exclusão, prevenindo perdas de dados catastróficas.
* **Arquitetura em Camadas:** Separação clara entre `Controller` (HTTP), `Service` (Regra de Negócio) e `Repository` (Acesso a Dados).

---

## 7. Limitações Conhecidas

* **Autenticação:** O sistema simula usuários via ID, mas não possui uma camada completa de JWT/OAuth2 implementada.
* **Pagamento Simulado:** O processamento de pagamento é apenas um log no sistema, sem integração com gateways reais (Stripe/Pagar.me).
* **Front-end:** A solução é puramente Backend/API.

---

## 8. Melhorias Futuras

Com mais tempo, implementaria:

1.  **Rate Limiting (@nestjs/throttler):** Para proteger a API contra ataques de força bruta ou scripts de bots tentando reservar todos os assentos.
2.  **Health Checks (@nestjs/terminus):** Endpoints para monitorar a saúde da conexão com Redis e RabbitMQ, vital para orquestradores como Kubernetes.
3.  **Dead Letter Queues (DLQ):** Configurar filas de erro no RabbitMQ para mensagens que falharam no processamento, permitindo re-tentativa manual.
4.  **Worker Dedicado:** Separar o consumidor de mensagens em um microsserviço isolado para escalar independentemente da API.
