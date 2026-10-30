# Decisão 004 — SQLite no desenvolvimento local

## Contexto

O Proffy 2.0 será desenvolvido localmente utilizando SQLite como banco de dados de desenvolvimento.

A escolha busca reduzir a complexidade do ambiente local e permitir que o projeto seja executado rapidamente em uma máquina de desenvolvimento, sem depender de um servidor MySQL externo.

## Decisão

Utilizar:

- SQLite no ambiente local;
- MySQL no ambiente de produção;
- Prisma como camada de acesso ao banco de dados.

## Ambientes

### Desenvolvimento

```text
Aplicação
   ↓
Fastify
   ↓
Prisma
   ↓
SQLite





==============================================================

Fase 3 — Modelagem do Proffy 2.0

Vamos evitar criar tabela diretamente. Primeiro vamos documentar o domínio.

1. Usuário

Será a entidade responsável pela autenticação.

User
├── id
├── name
├── email
├── passwordHash
├── role
├── createdAt
└── updatedAt

role inicialmente:

TEACHER
STUDENT

Isso nos permite ter um sistema de autenticação único.

2. Professor

O professor possui informações específicas além do usuário.

Teacher
├── id
├── userId
├── bio
├── hourlyRate
└── createdAt

Relacionamento:

User 1 ───── 1 Teacher
3. Aluno
Student
├── id
├── userId
└── createdAt

Relacionamento:

User 1 ───── 1 Student
4. Matéria

Uma matéria pode ser utilizada por vários professores.

Subject
├── id
├── name
└── slug

Exemplos:

Matemática
Português
Inglês
Física
Química
História

Como um professor pode ensinar várias matérias e uma matéria pode ter vários professores:

Teacher N ───── N Subject

Precisaremos de uma tabela intermediária:

TeacherSubject
├── teacherId
└── subjectId
5. Disponibilidade

O professor precisa informar quando pode dar aula.

Availability
├── id
├── teacherId
├── dayOfWeek
├── startTime
├── endTime
└── createdAt

Exemplo:

Professor: João
Dia: Segunda
08:00 → 12:00

Professor: João
Dia: Quarta
14:00 → 18:00
6. Agendamento

Essa é uma das entidades mais importantes.

Schedule
├── id
├── teacherId
├── studentId
├── scheduledAt
├── duration
├── status
└── createdAt

Relacionamento:

Teacher
   │
   │
   ├──── Schedule ──── Student
   │
   └──── Schedule ──── Student

Status inicialmente:

PENDING
CONFIRMED
CANCELLED
COMPLETED
Nosso modelo inicial

Ficamos então com:

                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
                 ┌─────────┴─────────┐
                 │                   │
                 ▼                   ▼
          ┌─────────────┐     ┌─────────────┐
          │   Teacher   │     │   Student   │
          └──────┬──────┘     └──────┬──────┘
                 │                   │
                 │                   │
                 ▼                   │
          TeacherSubject             │
                 │                   │
                 ▼                   │
             Subject                 │
                                     │
                 ┌───────────────────┘
                 │
                 ▼
             Schedule
                 ▲
                 │
              Teacher

E:

Teacher
   │
   └── Availability