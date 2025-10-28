const axios = require('axios');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

let accessToken = null;
let storeId = null;
let invoiceId = null;

console.log('🧾 Iniciando testes de Fiscal/Invoicing');

async function login() {
  const { loginSimple } = require('../helpers/auth-helper-simple.js');
  accessToken = await loginSimple('Fiscal Tester');
}

async function createStoreAndEnableFiscal() {
  console.log('🏪 Criando loja com feature FISCAL_INVOICING...');
  const storeResponse = await axios.post(`${BASE_URL}/stores`, {
    code: `FISCAL_STORE_${Date.now()}`,
    name: 'Loja Fiscal Test',
    timezone: 'America/Manaus',
    openingHours: { mon: [['08:00', '18:00']] },
    resourcesCatalog: ['GROOMER'],
    capacity: { GROOMER: 2 },
  }, { headers: { Authorization: `Bearer ${accessToken}` } });

  storeId = storeResponse.data.id;

  // Habilitar feature
  await axios.put(`${BASE_URL}/stores/${storeId}/features/FISCAL_INVOICING`, { enabled: true }, { headers: { Authorization: `Bearer ${accessToken}` } });
  console.log('   ✅ Feature FISCAL_INVOICING habilitada');
}

async function test1_CreateInvoice() {
  console.log('Test 1: POST /fiscal/stores/:storeId/invoices');
  const payload = {
    invoiceType: 'NFC_E',
    issuanceDate: new Date().toISOString(),
    totalAmount: 100.00,
    totalProducts: 100.00,
    totalServices: 0,
    discount: 0,
    freight: 0,
    totalTax: 10.00,
    paymentMethod: 'CASH',
    items: [{
      id: 'SKU-1',
      type: 'PRODUCT',
      description: 'Produto Teste',
      quantity: 1,
      unitValue: 100.00,
      totalValue: 100.00,
      taxRate: 0.1,
      taxValue: 10.00,
    }],
  };

  const response = await axios.post(`${BASE_URL}/fiscal/stores/${storeId}/invoices`, payload, { headers: { Authorization: `Bearer ${accessToken}` } });
  assert.strictEqual(response.status, 201);
  assert(response.data.id);
  invoiceId = response.data.id;
  console.log(`   ✅ Invoice criada: ${invoiceId}`);
}

async function test2_ListInvoices() {
  console.log('Test 2: GET /fiscal/stores/:storeId/invoices');
  const response = await axios.get(`${BASE_URL}/fiscal/stores/${storeId}/invoices`, { headers: { Authorization: `Bearer ${accessToken}` } });
  assert.strictEqual(response.status, 200);
  assert(Array.isArray(response.data));
  assert(response.data.length >= 1);
  console.log(`   ✅ ${response.data.length} invoice(s) encontradas`);
}

async function test3_GetInvoice() {
  console.log('Test 3: GET /fiscal/invoices/:id');
  const response = await axios.get(`${BASE_URL}/fiscal/invoices/${invoiceId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.data.id, invoiceId);
  console.log('   ✅ Invoice obtida com sucesso');
}

async function test4_CancelInvoice() {
  console.log('Test 4: PUT /fiscal/invoices/:id/cancel');
  const response = await axios.put(`${BASE_URL}/fiscal/invoices/${invoiceId}/cancel`, { reason: 'Cancelamento de teste' }, { headers: { Authorization: `Bearer ${accessToken}` } });
  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.data.status, 'CANCELED');
  console.log('   ✅ Invoice cancelada com sucesso');
}

async function runAllTests() {
  console.log('='.repeat(70));
  console.log('🧪 TESTES DE FISCAL/INVOICING');
  console.log('='.repeat(70));

  try {
    await login();
    await createStoreAndEnableFiscal();
    await test1_CreateInvoice();
    await test2_ListInvoices();
    await test3_GetInvoice();
    await test4_CancelInvoice();

    console.log('\n' + '='.repeat(70));
    console.log('✅ TODOS OS TESTES DE FISCAL PASSARAM!');
    console.log('='.repeat(70));
    return { success: true, invoiceId };
  } catch (error) {
    console.error('\n❌ Falha nos testes de Fiscal');
    throw error;
  }
}

if (require.main === module) {
  runAllTests().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { runAllTests };


