import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateEmployeesTable1729000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'employees',
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
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['SUPER_ADMIN', 'OWNER', 'ADMIN', 'STAFF', 'VIEWER'],
            default: "'STAFF'",
            isNullable: false,
          },
          {
            name: 'job_title',
            type: 'enum',
            enum: [
              'OWNER',
              'MANAGER',
              'RECEPTIONIST',
              'CUSTOMER_SERVICE',
              'VETERINARIAN',
              'VET_ASSISTANT',
              'GROOMER',
              'GROOMER_ASSISTANT',
              'BATHER',
              'PET_HANDLER',
              'DAYCARE_MONITOR',
              'JANITOR',
              'STOCK_MANAGER',
              'DELIVERY_DRIVER',
              'TRAINER',
              'NUTRITIONIST',
              'OTHER',
            ],
            isNullable: true,
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'work_schedule',
            type: 'json',
            isNullable: true,
            comment: 'JSON: { mon: [["08:00","12:00"],["14:00","18:00"]], ... }',
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

    // FKs
    await queryRunner.createForeignKey(
      'employees',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'employees',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Índices
    await queryRunner.createIndex(
      'employees',
      new TableIndex({
        name: 'IDX_EMPLOYEE_ORG_USER',
        columnNames: ['organization_id', 'user_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'employees',
      new TableIndex({
        name: 'IDX_EMPLOYEE_ROLE',
        columnNames: ['role'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('employees');
  }
}


