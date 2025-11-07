import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateAddressesTable1729000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'addresses',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'customer_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'is_primary',
            type: 'boolean',
            default: false,
          },
          {
            name: 'street',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'number',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'complement',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'district',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'state',
            type: 'varchar',
            length: '2',
            isNullable: false,
          },
          {
            name: 'zip',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'country',
            type: 'varchar',
            length: '2',
            default: "'BR'",
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
        ],
      }),
      true,
    );

    // FK
    await queryRunner.createForeignKey(
      'addresses',
      new TableForeignKey({
        columnNames: ['customer_id'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Índices
    await queryRunner.createIndex(
      'addresses',
      new TableIndex({
        name: 'IDX_ADDRESS_CUSTOMER',
        columnNames: ['customer_id'],
      }),
    );

    await queryRunner.createIndex(
      'addresses',
      new TableIndex({
        name: 'IDX_ADDRESS_PRIMARY',
        columnNames: ['customer_id', 'is_primary'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('addresses');
  }
}







