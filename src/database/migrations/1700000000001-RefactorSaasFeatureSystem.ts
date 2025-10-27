import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorSaasFeatureSystem1700000000001 implements MigrationInterface {
  name = 'RefactorSaasFeatureSystem1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Limpar dados existentes da tabela store_features
    await queryRunner.query(`DELETE FROM store_features`);
    
    // Adicionar coluna para indicar o tipo de acesso (STORE ou CUSTOMER)
    await queryRunner.query(`
      ALTER TABLE store_features 
      ADD COLUMN access_type ENUM('STORE', 'CUSTOMER') NOT NULL DEFAULT 'STORE'
    `);
    
    // Adicionar índice para melhor performance
    await queryRunner.query(`
      CREATE INDEX IDX_STORE_FEATURES_ACCESS_TYPE 
      ON store_features (store_id, access_type)
    `);
    
    // Adicionar índice único para evitar duplicatas
    await queryRunner.query(`
      CREATE UNIQUE INDEX IDX_STORE_FEATURES_UNIQUE 
      ON store_features (store_id, feature_key, access_type)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.query(`DROP INDEX IDX_STORE_FEATURES_UNIQUE ON store_features`);
    await queryRunner.query(`DROP INDEX IDX_STORE_FEATURES_ACCESS_TYPE ON store_features`);
    
    // Remover coluna
    await queryRunner.query(`ALTER TABLE store_features DROP COLUMN access_type`);
  }
}
