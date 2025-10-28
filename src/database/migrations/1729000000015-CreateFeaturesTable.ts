import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateFeaturesTable1729000000015 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'features',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'key',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
            comment: 'Identificador único da feature (ex: SERVICE_CATALOG, TELEPICKUP)',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'enum',
            enum: ['CORE', 'SERVICES', 'CUSTOMER', 'OPERATIONS', 'ANALYTICS', 'INTEGRATIONS'],
            default: "'CORE'",
          },
          {
            name: 'min_plan_required',
            type: 'enum',
            enum: ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'],
            default: "'FREE'",
            comment: 'Plano mínimo necessário para usar esta feature',
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'default_limits',
            type: 'json',
            isNullable: true,
            comment: 'Limites padrão ao habilitar a feature',
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
            comment: 'Configurações extras (icon, color, displayOrder, etc)',
          },
          {
            name: 'divisible',
            type: 'boolean',
            default: false,
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
            default: null,
          },
        ],
      }),
      true,
    );

    // Índices
    await queryRunner.createIndex(
      'features',
      new TableIndex({
        name: 'IDX_FEATURE_KEY',
        columnNames: ['key'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'features',
      new TableIndex({
        name: 'IDX_FEATURE_CATEGORY',
        columnNames: ['category'],
      }),
    );

    await queryRunner.createIndex(
      'features',
      new TableIndex({
        name: 'IDX_FEATURE_PLAN',
        columnNames: ['min_plan_required'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('features');
  }
}

