import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreatePersonDataTable1729200000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'person_data',
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
            name: 'fullName',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'documentType',
            type: 'enum',
            enum: ['cpf', 'cnpj', 'rg', 'passport'],
            isNullable: false,
          },
          {
            name: 'documentNumber',
            type: 'varchar',
            length: '20',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'birthDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'phoneAlternative',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'emailAlternative',
            type: 'varchar',
            length: '255',
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

    await queryRunner.createIndex(
      'person_data',
      new TableIndex({
        name: 'IDX_PERSON_DATA_CUSTOMER',
        columnNames: ['customer_id'],
      }),
    );

    await queryRunner.createIndex(
      'person_data',
      new TableIndex({
        name: 'IDX_PERSON_DATA_DOCUMENT',
        columnNames: ['documentNumber'],
      }),
    );

    await queryRunner.createForeignKey(
      'person_data',
      new TableForeignKey({
        name: 'FK_PERSON_DATA_CUSTOMER',
        columnNames: ['customer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'customers',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('person_data', 'FK_PERSON_DATA_CUSTOMER');
    await queryRunner.dropIndex('person_data', 'IDX_PERSON_DATA_DOCUMENT');
    await queryRunner.dropIndex('person_data', 'IDX_PERSON_DATA_CUSTOMER');
    await queryRunner.dropTable('person_data');
  }
}

