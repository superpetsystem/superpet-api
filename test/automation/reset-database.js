const mysql = require('mysql2/promise');

async function resetDatabase() {
  console.log('\n🗑️  Limpando banco de dados de teste...\n');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'superpet_test',
  });

  try {
    await connection.execute(`SET FOREIGN_KEY_CHECKS = 0`);
    
    // Deletar todas as tabelas na ordem correta (do dependente para o independente)
    const tables = [
      // Novos módulos
      'bookings',
      'veterinary_vaccinations',
      'veterinary_records',
      'stock_transfers',
      'stock_movements',
      'stock_alerts',
      'products',
      // Módulos existentes
      'live_cam_streams',
      'pickups',
      'store_features',
      'custom_services',
      'services',
      'appointments',
      'pets',
      'customer_addresses',
      'customers',
      'employee_stores',
      'employees',
      'users',
      'stores',
      'token_blacklist',
      'organizations',
    ];

    console.log('📋 Deletando dados das tabelas...');
    for (const table of tables) {
      try {
        // Verificar se a tabela existe antes de deletar
        const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
        if (rows.length > 0) {
          await connection.execute(`DELETE FROM ${table}`);
          console.log(`   ✅ ${table}`);
        } else {
          console.log(`   ⚠️  ${table} (não existe)`);
        }
      } catch (error) {
        console.log(`   ❌ ${table} (erro: ${error.message})`);
      }
    }

    await connection.execute(`SET FOREIGN_KEY_CHECKS = 1`);

    console.log('\n✅ Banco de dados limpo com sucesso!');
    console.log('\n💡 Execute o seed para recriar os dados iniciais:');
    console.log('   npm run typeorm migration:run');
    console.log('   npm run seed\n');

  } catch (error) {
    console.error('\n❌ Erro ao limpar banco:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

resetDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

