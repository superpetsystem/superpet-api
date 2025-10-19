import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePersonalDataTable1729000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'personal_data',
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
            name: 'cpf',
            type: 'varchar',
            length: '11',
            isNullable: true,
            comment: 'Apenas dígitos, criptografado',
          },
          {
            name: 'rg',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'issuer',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Órgão emissor do RG',
          },
          {
            name: 'birthdate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'gender',
            type: 'enum',
            enum: ['M', 'F', 'OTHER', 'PREFER_NOT_SAY'],
            isNullable: true,
          },
          {
            name: 'guardian_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Se menor de 18 anos',
          },
          {
            name: 'guardian_phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
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
      'personal_data',
      new TableForeignKey({
        columnNames: ['customer_id'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Índice único para customer (1:1)
    await queryRunner.createIndex(
      'personal_data',
      new TableIndex({
        name: 'IDX_PERSONAL_DATA_CUSTOMER',
        columnNames: ['customer_id'],
        isUnique: true,
      }),
    );

    // Índice para CPF (com subquery de organization_id)
    await queryRunner.createIndex(
      'personal_data',
      new TableIndex({
        name: 'IDX_PERSONAL_DATA_CPF',
        columnNames: ['cpf'],
        where: 'cpf IS NOT NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('personal_data');
  }
}


