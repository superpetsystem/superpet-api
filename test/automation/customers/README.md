# 👥 Testes de Customers

Testes automatizados para o módulo de Customers (incluindo Address e PersonData).

## Como executar

```bash
node test/automation/customers/customers.test.js
```

## O que é testado

### ✅ CRUD Completo
- Criar customer (com user, address e personData)
- Listar customers (paginado)
- Listar customers (simples - array direto)
- Buscar por ID
- Buscar por email
- Atualizar customer (incluindo address e personData)
- Deletar customer

### ✅ Validações
- Email duplicado
- Autenticação obrigatória
- Documento único (CPF/CNPJ)

### ✅ Testes em Massa
- **Criar 100 customers** com:
  - 100 Users
  - 100 Addresses
  - 100 PersonData
  - Dados únicos e variados

## 📊 Estatísticas

- **Total de testes**: 11
- **Taxa de sucesso**: 100%
- **Registros criados**: 
  - 100 Customers
  - 100 Addresses
  - 100 PersonData

## 🎯 Resultados Esperados

```
✅ PASSOU: 11/11 testes
🎉 TODOS OS TESTES PASSARAM!
```

## 📋 Estrutura de Dados

Cada customer criado inclui:
- **User**: email, password, name
- **Customer**: phone, notes, active
- **Address**: zipCode, street, number, complement, neighborhood, city, state, country
- **PersonData**: fullName, documentType, documentNumber, birthDate, phones, emails

