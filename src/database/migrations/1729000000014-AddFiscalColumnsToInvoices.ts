import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class AddFiscalColumnsToInvoices1729000000014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = 'invoices';

    const hasTable = await queryRunner.hasTable(table);
    if (!hasTable) {
      await queryRunner.createTable(
        new Table({
          name: table,
          columns: [
            { name: 'id', type: 'varchar', length: '36', isPrimary: true },
            { name: 'store_id', type: 'varchar', length: '36', isNullable: false },
            { name: 'customer_id', type: 'varchar', length: '36', isNullable: true },
            { name: 'invoice_type', type: "enum", enum: ['NFC_E', 'NF_E', 'SAT_CF_E'], default: "'NFC_E'" },
            { name: 'status', type: "enum", enum: ['DRAFT','PENDING','PROCESSING','AUTHORIZED','DENIED','CANCELED','CONTINGENCY'], default: "'DRAFT'" },
            { name: 'access_key', type: 'varchar', length: '64', isNullable: true, isUnique: true },
            { name: 'number', type: 'int', isNullable: false, isUnique: true },
            { name: 'series', type: 'varchar', length: '3', default: "'001'" },
            { name: 'issuance_date', type: 'datetime', isNullable: false },
            { name: 'total_amount', type: 'decimal', precision: 10, scale: 2, isNullable: false },
            { name: 'total_products', type: 'decimal', precision: 10, scale: 2, isNullable: false },
            { name: 'total_services', type: 'decimal', precision: 10, scale: 2, isNullable: false },
            { name: 'discount', type: 'decimal', precision: 10, scale: 2, default: 0 },
            { name: 'freight', type: 'decimal', precision: 10, scale: 2, default: 0 },
            { name: 'total_tax', type: 'decimal', precision: 10, scale: 2, default: 0 },
            { name: 'payment_method', type: "enum", enum: ['CASH','DEBIT_CARD','CREDIT_CARD','PIX','BANK_SLIP'], isNullable: false },
            { name: 'items', type: 'json', isNullable: true },
            { name: 'xmlContent', type: 'json', isNullable: true },
            { name: 'xml_url', type: 'varchar', length: '500', isNullable: true },
            { name: 'danfe_url', type: 'varchar', length: '500', isNullable: true },
            { name: 'protocol', type: 'varchar', length: '100', isNullable: true },
            { name: 'denied_reason', type: 'text', isNullable: true },
            { name: 'cancellation_date', type: 'datetime', isNullable: true },
            { name: 'contingency', type: 'boolean', default: false },
            { name: 'contingencyData', type: 'json', isNullable: true },
            { name: 'metadata', type: 'json', isNullable: true },
            { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
            { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
          ],
          foreignKeys: [
            { columnNames: ['store_id'], referencedTableName: 'stores', referencedColumnNames: ['id'], onDelete: 'CASCADE' },
            { columnNames: ['customer_id'], referencedTableName: 'customers', referencedColumnNames: ['id'], onDelete: 'SET NULL' },
          ],
        }),
        true,
      );
      return; // table created with all columns
    }

    const addIfMissing = async (name: string, column: TableColumn) => {
      const has = await queryRunner.hasColumn(table, name);
      if (!has) {
        await queryRunner.addColumn(table, column);
      }
    };

    await addIfMissing('xmlContent', new TableColumn({
      name: 'xmlContent',
      type: 'json',
      isNullable: true,
    }));

    await addIfMissing('contingencyData', new TableColumn({
      name: 'contingencyData',
      type: 'json',
      isNullable: true,
    }));

    await addIfMissing('metadata', new TableColumn({
      name: 'metadata',
      type: 'json',
      isNullable: true,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = 'invoices';

    const dropIfExists = async (name: string) => {
      const has = await queryRunner.hasColumn(table, name);
      if (has) {
        await queryRunner.dropColumn(table, name);
      }
    };

    await dropIfExists('metadata');
    await dropIfExists('contingencyData');
    await dropIfExists('xmlContent');
  }
}


