import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateInventoryTables1729000000017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Tabela de Produtos
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'organization_id',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'enum',
            enum: ['FOOD', 'HYGIENE', 'MEDICINE', 'ACCESSORY', 'TOY', 'SERVICE_SUPPLY', 'OTHER'],
            default: "'OTHER'",
          },
          {
            name: 'unit',
            type: 'enum',
            enum: ['UNIT', 'KG', 'G', 'L', 'ML', 'PACK', 'BOX'],
            default: "'UNIT'",
          },
          {
            name: 'cost_price_cents',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'sale_price_cents',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'min_stock',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
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
        indices: [
          {
            name: 'IDX_PRODUCT_ORG_CODE',
            columnNames: ['organization_id', 'code'],
            isUnique: true,
          },
          {
            name: 'IDX_PRODUCT_ORG',
            columnNames: ['organization_id'],
          },
          {
            name: 'IDX_PRODUCT_CATEGORY',
            columnNames: ['category'],
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // 2. Tabela de Estoque por Loja
    await queryRunner.createTable(
      new Table({
        name: 'inventory_stocks',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'organization_id',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'store_id',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'product_id',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'quantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'reserved',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'available',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'last_count_at',
            type: 'timestamp',
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
        indices: [
          {
            name: 'IDX_STOCK_STORE_PRODUCT',
            columnNames: ['store_id', 'product_id'],
            isUnique: true,
          },
          {
            name: 'IDX_STOCK_ORG',
            columnNames: ['organization_id'],
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'inventory_stocks',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'inventory_stocks',
      new TableForeignKey({
        columnNames: ['store_id'],
        referencedTableName: 'stores',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'inventory_stocks',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // 3. Tabela de Movimentações de Estoque
    await queryRunner.createTable(
      new Table({
        name: 'inventory_movements',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'organization_id',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'store_id',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'product_id',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['ENTRY', 'EXIT', 'ADJUSTMENT', 'TRANSFER', 'LOSS', 'RETURN'],
          },
          {
            name: 'quantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'reason',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'reference_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'reference_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'employee_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'cost_price_cents',
            type: 'int',
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
        ],
        indices: [
          {
            name: 'IDX_MOVEMENT_STORE',
            columnNames: ['store_id', 'created_at'],
          },
          {
            name: 'IDX_MOVEMENT_PRODUCT',
            columnNames: ['product_id', 'created_at'],
          },
          {
            name: 'IDX_MOVEMENT_TYPE',
            columnNames: ['type'],
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'inventory_movements',
      new TableForeignKey({
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'inventory_movements',
      new TableForeignKey({
        columnNames: ['store_id'],
        referencedTableName: 'stores',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'inventory_movements',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'inventory_movements',
      new TableForeignKey({
        columnNames: ['employee_id'],
        referencedTableName: 'employees',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('inventory_movements');
    await queryRunner.dropTable('inventory_stocks');
    await queryRunner.dropTable('products');
  }
}

