# API de Contatos

API REST desenvolvida em Node.js, Express, TypeScript e MySQL para gerenciamento de contatos, atendendo aos requisitos do desafio técnico para Desenvolvedor Back End Jr.

## Sumário

1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
4. [Execução da Aplicação e Testes](#execução-da-aplicação-e-testes)
5. [Documentação das Rotas](#documentação-das-rotas)
6. [Regras de Validação](#regras-de-validação)
7. [Decisões Técnicas e Arquiteturais](#decisões-técnicas-e-arquiteturais)

## Requisitos do Sistema

- Node.js 18 ou superior
- npm 9 ou superior
- MySQL 8.0 (via Docker Compose ou instalação local)

## Configuração do Ambiente

1. Instale as dependências do projeto:

```bash
npm install
```

2. Crie o arquivo `.env` na raiz do projeto copiando o modelo `.env.example`:

```bash
cp .env.example .env
```

Variáveis disponíveis no arquivo `.env`:

| Variável | Descrição | Valor Padrão |
|---|---|---|
| `PORT` | Porta HTTP onde a API será executada | `3000` |
| `DB_HOST` | Host do servidor MySQL | `localhost` |
| `DB_PORT` | Porta do servidor MySQL | `3306` |
| `DB_USER` | Usuário de conexão ao MySQL | `root` |
| `DB_PASSWORD` | Senha do usuário do MySQL | `root` |
| `DB_NAME` | Nome do banco de dados | `contatos_db` |

## Configuração do Banco de Dados

### Opção 1: Usando Docker Compose (Recomendado)

Suba o container do MySQL 8.0 já com o banco `contatos_db` e a tabela `contatos` criados automaticamente:

```bash
docker compose up -d
```

### Opção 2: Usando MySQL Local

Caso utilize uma instância local do MySQL, execute o script `database/schema.sql`:

```bash
mysql -u root -p < database/schema.sql
```

Estrutura criada pelo script:

```sql
CREATE DATABASE IF NOT EXISTS contatos_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE contatos_db;

CREATE TABLE IF NOT EXISTS contatos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Execução da Aplicação e Testes

- Executar em modo de desenvolvimento (com recarregamento automático):

```bash
npm run dev
```

- Compilar o projeto TypeScript para JavaScript (`dist/`):

```bash
npm run build
```

- Executar a versão compilada em produção:

```bash
npm start
```

- Executar a suíte de testes automatizados (unitários e integração):

```bash
npm test
```

## Documentação das Rotas

### 1. Criar contato (`POST /contatos`)

Cria um novo contato no banco de dados.

- **Request Body:**

```json
{
  "nome": "Carlos Eduardo",
  "telefone": "(11) 98765-4321"
}
```

- **Respostas:**
  - `201 Created`:

```json
{
  "id": 1,
  "nome": "Carlos Eduardo",
  "telefone": "(11) 98765-4321"
}
```

  - `400 Bad Request`:

```json
{
  "erro": "O nome deve conter no mínimo duas palavras, cada uma com pelo menos 3 letras."
}
```

- **Exemplo cURL:**

```bash
curl -X POST http://localhost:3000/contatos \
  -H "Content-Type: application/json" \
  -d '{"nome": "Carlos Eduardo", "telefone": "(11) 98765-4321"}'
```

### 2. Listar contatos (`GET /contatos`)

Retorna todos os contatos cadastrados ordenados por `id`.

- **Respostas:**
  - `200 OK`:

```json
[
  {
    "id": 1,
    "nome": "Carlos Eduardo",
    "telefone": "(11) 98765-4321"
  }
]
```

- **Exemplo cURL:**

```bash
curl -X GET http://localhost:3000/contatos
```

### 3. Atualizar contato (`PATCH /contatos/:id`)

Atualiza os dados de um contato existente.

- **Request Body:**

```json
{
  "nome": "Roberto Almeida",
  "telefone": "(11) 91234-5678"
}
```

- **Respostas:**
  - `200 OK`:

```json
{
  "id": 1,
  "nome": "Roberto Almeida",
  "telefone": "(11) 91234-5678"
}
```

  - `400 Bad Request`: `{"erro": "Id inválido."}` ou erro de validação dos campos.
  - `404 Not Found`: `{"erro": "Contato não encontrado."}`

- **Exemplo cURL:**

```bash
curl -X PATCH http://localhost:3000/contatos/1 \
  -H "Content-Type: application/json" \
  -d '{"nome": "Roberto Almeida", "telefone": "(11) 91234-5678"}'
```

### 4. Excluir contato (`DELETE /contatos/:id`)

Remove um contato existente do banco de dados.

- **Respostas:**
  - `204 No Content`: Sem corpo de resposta.
  - `400 Bad Request`: `{"erro": "Id inválido."}`
  - `404 Not Found`: `{"erro": "Contato não encontrado."}`

- **Exemplo cURL:**

```bash
curl -i -X DELETE http://localhost:3000/contatos/1
```

## Regras de Validação

- **`nome`**:
  - Obrigatório e do tipo `string`.
  - Normalizado com `trim()`, colapso de espaços múltiplos internos e normalização Unicode `NFC`.
  - Tamanho máximo de 150 caracteres.
  - Deve possuir no mínimo 2 palavras separadas por espaço.
  - Cada palavra deve conter no mínimo 3 caracteres compostos exclusivamente por letras Unicode (`\p{L}`), suportando acentuação da língua portuguesa.
- **`telefone`**:
  - Obrigatório e do tipo `string`.
  - Tamanho máximo de 20 caracteres após remoção de espaços excedentes.
  - Permite apenas dígitos numéricos, espaços e os símbolos `+`, `-`, `(` e `)`.
  - Deve conter entre 8 e 15 dígitos numéricos (padrão telefônico nacional fixo/móvel e internacional E.164).
- **`id` (parâmetro de rota)**:
  - Deve ser um número inteiro positivo válido dentro do limite de `INT UNSIGNED` do MySQL.

## Decisões Técnicas e Arquiteturais

1. **Adoção de TypeScript (`strict: true`):**
   Escolhido para assegurar verificação estática de tipos em tempo de compilação, contratos explícitos entre camadas (`Contact`, `ContactInput`) e prevenção de falhas de tipo em tempo de execução, mantendo total alinhamento com a stack Node.js, Express e TypeScript adotada pela Port Louis.

2. **Infraestrutura Reprodutível com `docker-compose.yml` + `database/schema.sql`:**
   O arquivo `docker-compose.yml` provisiona o MySQL 8.0 com healthcheck configurado e executa automaticamente o script `database/schema.sql` via `/docker-entrypoint-initdb.d/`, permitindo subir o banco e a tabela `contatos` prontos para uso com um único comando (`docker compose up -d`). Ao mesmo tempo, o arquivo `database/schema.sql` desacoplado permite a execução direta em qualquer instância local de MySQL sem depender de Docker.

3. **Separação em Camadas (`routes` -> `controller` -> `service` -> `validator` / `repository`):**
   Cada responsabilidade foi isolada em um módulo único: roteamento HTTP, manipulação de objetos do Express, regras de negócio, funções puras de validação e acesso a dados via Pool de Conexões (`mysql2/promise`) com Prepared Statements (`?`). Essa divisão facilita a leitura, manutenção, prevenção contra SQL Injection e testes isolados.

4. **Validação Estrita em `PATCH /contatos/:id` Exigindo `nome` e `telefone`:**
   O enunciado especifica explicitamente o contrato `Body: {"nome": "string", "telefone": "string"}` para a rota `PATCH /contatos/:id`. Para manter fidelidade estrita ao contrato definido no desafio e evitar divergências com baterias de correção automatizadas, ambos os campos são obrigatórios e validados com o mesmo rigor da criação.

5. **Retorno `204 No Content` Sem Corpo em `DELETE /contatos/:id`:**
   Em conformidade estrita com a especificação do desafio (que define `Status Code: 204` sem `Response Body`) e com a RFC 9110 do protocolo HTTP (na qual respostas `204` não transportam message body), a exclusão bem-sucedida é encerrada com `res.status(204).send()` sem payload JSON.

6. **Regra Literal de Validação do Nome com Suporte Unicode (`\p{L}`):**
   O requisito determina que o nome contenha no mínimo duas palavras, cada uma com pelo menos 3 letras. A validação aplica normalização Unicode `NFC` e valida cada palavra com a expressão regular `/^\p{L}{3,}$/u`, garantindo suporte completo a nomes acentuados da língua portuguesa (como `João`, `Conceição`, `Ítalo`) e bloqueando números, símbolos, tags HTML ou palavras com menos de 3 letras.

7. **Prevenção de Mass Assignment e Tratamento Centralizado de Erros:**
   O validador extrai exclusivamente `nome` e `telefone` do corpo recebido, ignorando quaisquer propriedades extras enviadas na requisição. O middleware global `errorHandler` padroniza todas as respostas de erro no contrato `{"erro": "mensagem"}`, trata payloads malformados (`400`) ou acima de `10kb` (`413`) e impede que falhas internas (`500`) exponham stack traces ou mensagens nativas do banco de dados.

8. **Testes Automatizados com Jest e Supertest:**
   A suíte de testes automatizados (unitários para o módulo de validação e de integração HTTP com Supertest para todas as rotas) garante a verificação imediata de todos os contratos HTTP (`201`, `200`, `204`, `400`, `404`, `413`, `500`) e das regras de negócio sem exigir que uma instância externa do MySQL esteja ativa para executar `npm test`.
