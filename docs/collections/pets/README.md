# 🐾 Postman Collection - Pets

Collection do Postman para testar os endpoints de Pets.

## 📂 Arquivo

- `SuperPet-Pets.postman_collection.json`

## 📋 Endpoints Incluídos

1. **Create Pet (Dog)** - POST `/pets`
2. **Create Pet (Cat)** - POST `/pets`
3. **Create Pet (Bird)** - POST `/pets`
4. **Get All Pets (Paginated)** - GET `/pets?page=1&limit=10`
5. **Get All Pets (Simple)** - GET `/pets/all`
6. **Get Pet by ID** - GET `/pets/:id`
7. **Get Pets by Customer** - GET `/pets/customer/:customerId`
8. **Update Pet (Partial)** - PUT `/pets/:id`
9. **Update Pet (Complete)** - PUT `/pets/:id`
10. **Delete Pet** - DELETE `/pets/:id`

## 🔧 Variáveis Necessárias

Configure no environment:
- `baseUrl` - URL da API (ex: `http://localhost:3000`)
- `accessToken` - Token JWT obtido no login
- `customerId` - ID do customer dono do pet
- `petId` - ID do pet (obtido após criar)

## ✅ Exemplos de Response

Todos os endpoints incluem exemplos de responses com:
- Status codes (200, 201, 204, 400, 404)
- JSON de resposta formatado
- Headers
- Relacionamentos (customer completo)

## 🐕 Tipos de Pet

Exemplos incluídos para:
- **Dog**: Labrador, Bulldog, Poodle
- **Cat**: Siamês, Persa, Maine Coon
- **Bird**: Papagaio, Canário, Calopsita
- **Rabbit**: Angorá, Mini Lop
- **Other**: Hamster, Tartaruga

## 🚀 Importar

1. Abra o Postman
2. Clique em **Import**
3. Selecione `SuperPet-Pets.postman_collection.json`
4. Configure o environment
5. Crie um customer primeiro
6. Execute as requests de pets!

