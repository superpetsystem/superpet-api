import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAccessTypeToStoreFeatures1761655700000 implements MigrationInterface {
  name = 'AddAccessTypeToStoreFeatures1761655700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('store_features');
    if (!hasTable) return;

    const table = await queryRunner.getTable('store_features');
    const hasColumn = table?.findColumnByName('access_type');

    if (!hasColumn) {
      await queryRunner.addColumn(
        'store_features',
        new TableColumn({
          name: 'access_type',
          type: 'enum',
          enum: ['STORE', 'CUSTOMER'],
          default: "'STORE'",
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('store_features');
    if (!hasTable) return;
    const table = await queryRunner.getTable('store_features');
    if (table?.findColumnByName('access_type')) {
      await queryRunner.dropColumn('store_features', 'access_type');
    }
  }
}


