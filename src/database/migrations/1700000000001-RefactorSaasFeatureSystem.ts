import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorSaasFeatureSystem1700000000001 implements MigrationInterface {
  name = 'RefactorSaasFeatureSystem1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // No-op on fresh databases (originally altered store_features)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No-op
  }
}
