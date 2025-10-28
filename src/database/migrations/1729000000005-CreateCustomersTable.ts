import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateCustomersTable1729000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'customers',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'organization_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
            comment: 'Opcional - cliente pode não ter login',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'INACTIVE'],
            default: "'ACTIVE'",
            isNullable: false,
          },
          {
            name: 'marketing_consent',
            type: 'json',
            isNullable: true,
            comment: 'JSON: { email: { accepted: true, consentAt: "ISO" }, sms: {...}, whatsapp: {...} }',
          },
          {
            name: 'source',
            type: 'enum',
            enum: ['PDV', 'Portal', 'Import', 'Other'],
            default: "'PDV'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // FKs
    await queryRunner.createForeignKey(
      'customers',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'customers',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Índices
    await queryRunner.createIndex(
      'customers',
      new TableIndex({
        name: 'IDX_CUSTOMER_ORG_EMAIL',
        columnNames: ['organization_id', 'email'],
        isUnique: true,
        where: 'email IS NOT NULL',
      }),
    );

    await queryRunner.createIndex(
      'customers',
      new TableIndex({
        name: 'IDX_CUSTOMER_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'customers',
      new TableIndex({
        name: 'IDX_CUSTOMER_NAME',
        columnNames: ['name'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('customers');
  }
}






