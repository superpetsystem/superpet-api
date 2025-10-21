import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateVeterinaryRecordsTable1729000000020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tabela principal: veterinary_records
    await queryRunner.createTable(
      new Table({
        name: 'veterinary_records',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'organization_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'pet_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'store_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'veterinarian_id', type: 'varchar', length: '36', isNullable: false },
          {
            name: 'type',
            type: 'enum',
            enum: ['CONSULTATION', 'SURGERY', 'VACCINATION', 'EXAM', 'EMERGENCY', 'FOLLOW_UP'],
            isNullable: false,
          },
          { name: 'visit_date', type: 'timestamp', isNullable: false },
          { name: 'reason', type: 'text', isNullable: false },
          { name: 'symptoms', type: 'text', isNullable: true },
          { name: 'diagnosis', type: 'text', isNullable: true },
          { name: 'treatment', type: 'text', isNullable: true },
          { name: 'prescriptions', type: 'json', isNullable: true },
          { name: 'weight_kg', type: 'decimal', precision: 5, scale: 2, isNullable: true },
          { name: 'temperature_celsius', type: 'decimal', precision: 4, scale: 1, isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', isNullable: false },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'veterinary_records',
      new TableIndex({
        name: 'IDX_VET_RECORD_PET',
        columnNames: ['pet_id', 'visit_date'],
      }),
    );

    await queryRunner.createIndex(
      'veterinary_records',
      new TableIndex({
        name: 'IDX_VET_RECORD_VET',
        columnNames: ['veterinarian_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'veterinary_records',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'organizations',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'veterinary_records',
      new TableForeignKey({
        columnNames: ['pet_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'pets',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'veterinary_records',
      new TableForeignKey({
        columnNames: ['store_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'stores',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'veterinary_records',
      new TableForeignKey({
        columnNames: ['veterinarian_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'employees',
        onDelete: 'RESTRICT',
      }),
    );

    // Tabela: vaccinations
    await queryRunner.createTable(
      new Table({
        name: 'vaccinations',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'pet_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'record_id', type: 'varchar', length: '36', isNullable: true },
          { name: 'vaccine_name', type: 'varchar', length: '255', isNullable: false },
          { name: 'manufacturer', type: 'varchar', length: '255', isNullable: true },
          { name: 'batch_number', type: 'varchar', length: '100', isNullable: true },
          { name: 'application_date', type: 'date', isNullable: false },
          { name: 'next_dose_date', type: 'date', isNullable: true },
          { name: 'veterinarian_id', type: 'varchar', length: '36', isNullable: false },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', isNullable: false },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'vaccinations',
      new TableIndex({
        name: 'IDX_VACCINATION_PET',
        columnNames: ['pet_id', 'application_date'],
      }),
    );

    await queryRunner.createForeignKey(
      'vaccinations',
      new TableForeignKey({
        columnNames: ['pet_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'pets',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'vaccinations',
      new TableForeignKey({
        columnNames: ['record_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'veterinary_records',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'vaccinations',
      new TableForeignKey({
        columnNames: ['veterinarian_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'employees',
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('vaccinations');
    await queryRunner.dropTable('veterinary_records');
  }
}

