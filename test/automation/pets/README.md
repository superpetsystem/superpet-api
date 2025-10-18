# 🐾 Testes de Pets

Testes automatizados para o módulo de Pets.

## Como executar

```bash
node test/automation/pets/pets.test.js
```

## O que é testado

### ✅ CRUD Completo
- Criar pet
- Criar múltiplos pets
- Listar pets (paginado)
- Listar pets (simples - array direto)
- Buscar por ID
- Buscar por customer
- Atualizar pet (parcial e completo)
- Deletar pet

### ✅ Validações
- Customer inválido
- Autenticação obrigatória
- Relacionamento com customer

### ✅ Testes em Massa
- **Criar 100 pets** com:
  - 5 tipos diferentes (dog, cat, bird, rabbit, other)
  - Raças variadas por tipo
  - Pesos aleatórios
  - Datas de nascimento variadas
  - Gêneros alternados

### ✅ Testes de Paginação
- Verificar limite correto
- Verificar hasNextPage
- Verificar hasPreviousPage
- Verificar totalPages

## 📊 Estatísticas

- **Total de testes**: 14
- **Taxa de sucesso**: 100%
- **Registros criados**: 100+ pets

## 🎯 Resultados Esperados

```
✅ PASSOU: 14/14 testes
🎉 TODOS OS TESTES PASSARAM!
```

## 🐕 Tipos de Pets Testados

### Dogs (Cachorros)
- Labrador, Bulldog, Poodle, Golden Retriever, Pastor Alemão

### Cats (Gatos)
- Siamês, Persa, Maine Coon, Bengal, Ragdoll

### Birds (Pássaros)
- Papagaio, Canário, Periquito, Calopsita, Arara

### Rabbits (Coelhos)
- Angorá, Mini Lop, Holandês, Rex, Lionhead

### Others (Outros)
- Hamster, Porquinho da Índia, Tartaruga, Iguana, Furão

## 📋 Dados Criados

Cada teste cria:
- 1 pet inicial (Rex - Labrador)
- 2 pets adicionais (Mimi - Siamês, Loro - Papagaio)
- 100 pets em massa com variedade de tipos e raças

