const mysql = require('mysql2/promise');

async function updateOrgLimits() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'superpet_test',
  });

  try {
    const limits = JSON.stringify({ employees: 500, stores: 100, monthlyAppointments: 50000 });
    
    // Atualizar Org 1
    await connection.execute(
      `UPDATE organizations 
       SET limits = ?, plan = 'PRO'
       WHERE id = '00000000-0000-0000-0000-000000000001'`,
      [limits]
    );

    // Atualizar Org 2
    await connection.execute(
      `UPDATE organizations 
       SET limits = ?, plan = 'PRO'
       WHERE id = '00000000-0000-0000-0000-000000000002'`,
      [limits]
    );

    console.log('✅ Limites das Orgs atualizados:');
    console.log('   Employees: 500');
    console.log('   Stores: 100');
    console.log('   Monthly Appointments: 50000');

    // Verificar
    const [rows] = await connection.execute(
      `SELECT id, plan, limits FROM organizations WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002')`
    );
    console.log('\n📋 Organizações atualizadas:');
    rows.forEach(row => console.log(`  ${row.id}: ${row.plan}`, row.limits));

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

updateOrgLimits()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

