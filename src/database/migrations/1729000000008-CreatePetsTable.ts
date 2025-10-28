import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePetsTable1729000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pets',
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
            name: 'customer_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'species',
            type: 'enum',
            enum: ['DOG', 'CAT', 'BIRD', 'RABBIT', 'OTHER'],
            isNullable: false,
          },
          {
            name: 'breed',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'birthdate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'weight_kg',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'allergies',
            type: 'json',
            isNullable: true,
            comment: 'Array de strings',
          },
          {
            name: 'microchip',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'INACTIVE', 'DECEASED'],
            default: "'ACTIVE'",
            isNullable: false,
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
      'pets',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'pets',
      new TableForeignKey({
        columnNames: ['customer_id'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Índices
    await queryRunner.createIndex(
      'pets',
      new TableIndex({
        name: 'IDX_PET_ORG_MICROCHIP',
        columnNames: ['organization_id', 'microchip'],
        isUnique: true,
        where: 'microchip IS NOT NULL',
      }),
    );

    await queryRunner.createIndex(
      'pets',
      new TableIndex({
        name: 'IDX_PET_CUSTOMER',
        columnNames: ['customer_id'],
      }),
    );

    await queryRunner.createIndex(
      'pets',
      new TableIndex({
        name: 'IDX_PET_STATUS',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pets');
  }
}






