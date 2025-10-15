import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTokenBlacklistTable1760486982213 implements MigrationInterface {
    name = 'CreateTokenBlacklistTable1760486982213'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`token_blacklist\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`tokenHash\` varchar(64) NOT NULL, \`expiresAt\` timestamp NOT NULL, \`userId\` varchar(255) NOT NULL, \`reason\` varchar(50) NOT NULL DEFAULT 'logout', INDEX \`IDX_TOKEN_BLACKLIST_EXPIRES\` (\`expiresAt\`), INDEX \`IDX_TOKEN_BLACKLIST_HASH\` (\`tokenHash\`), UNIQUE INDEX \`IDX_9753c86826e3cb79ab5a34e2b0\` (\`tokenHash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_9753c86826e3cb79ab5a34e2b0\` ON \`token_blacklist\``);
        await queryRunner.query(`DROP INDEX \`IDX_TOKEN_BLACKLIST_HASH\` ON \`token_blacklist\``);
        await queryRunner.query(`DROP INDEX \`IDX_TOKEN_BLACKLIST_EXPIRES\` ON \`token_blacklist\``);
        await queryRunner.query(`DROP TABLE \`token_blacklist\``);
    }

}
