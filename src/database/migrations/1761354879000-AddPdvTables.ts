import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPdvTables1761354879000 implements MigrationInterface {
    name = 'AddPdvTables1761354879000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create carts table
        await queryRunner.query(`
            CREATE TABLE \`carts\` (
                \`id\` varchar(36) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`organizationId\` varchar(36) NOT NULL,
                \`storeId\` varchar(36) NOT NULL,
                \`customerId\` varchar(36) NULL,
                \`employeeId\` varchar(36) NULL,
                \`status\` enum ('OPEN', 'PENDING_PAYMENT', 'COMPLETED', 'ABANDONED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
                \`subtotal\` decimal(10,2) NOT NULL DEFAULT '0.00',
                \`discountAmount\` decimal(10,2) NOT NULL DEFAULT '0.00',
                \`taxAmount\` decimal(10,2) NOT NULL DEFAULT '0.00',
                \`totalAmount\` decimal(10,2) NOT NULL DEFAULT '0.00',
                \`metadata\` json NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create cart_items table
        await queryRunner.query(`
            CREATE TABLE \`cart_items\` (
                \`id\` varchar(36) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`cartId\` varchar(36) NOT NULL,
                \`organizationId\` varchar(36) NOT NULL,
                \`type\` enum ('SERVICE', 'PRODUCT') NOT NULL,
                \`serviceId\` varchar(36) NULL,
                \`productId\` varchar(36) NULL,
                \`name\` varchar(255) NOT NULL,
                \`unitPrice\` decimal(10,2) NOT NULL,
                \`quantity\` decimal(10,2) NOT NULL,
                \`discountAmount\` decimal(10,2) NOT NULL DEFAULT '0.00',
                \`taxAmount\` decimal(10,2) NOT NULL DEFAULT '0.00',
                \`totalAmount\` decimal(10,2) NOT NULL,
                \`metadata\` json NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create transactions table
        await queryRunner.query(`
            CREATE TABLE \`transactions\` (
                \`id\` varchar(36) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`organizationId\` varchar(36) NOT NULL,
                \`storeId\` varchar(36) NOT NULL,
                \`cartId\` varchar(36) NOT NULL,
                \`transactionNumber\` varchar(50) NOT NULL,
                \`amount\` decimal(10,2) NOT NULL,
                \`paymentMethod\` enum ('CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'CASH', 'BANK_TRANSFER', 'OTHER') NOT NULL,
                \`status\` enum ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
                \`metadata\` json NULL,
                UNIQUE INDEX \`IDX_transaction_number\` (\`transactionNumber\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Create receipts table
        await queryRunner.query(`
            CREATE TABLE \`receipts\` (
                \`id\` varchar(36) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`organizationId\` varchar(36) NOT NULL,
                \`storeId\` varchar(36) NOT NULL,
                \`cartId\` varchar(36) NOT NULL,
                \`receiptNumber\` varchar(50) NOT NULL,
                \`type\` enum ('SALE', 'REFUND', 'EXCHANGE') NOT NULL DEFAULT 'SALE',
                \`totalAmount\` decimal(10,2) NOT NULL,
                \`itemsDetails\` json NULL,
                \`paymentDetails\` json NULL,
                \`metadata\` json NULL,
                UNIQUE INDEX \`IDX_receipt_number\` (\`receiptNumber\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE \`cart_items\` 
            ADD CONSTRAINT \`FK_cart_items_cart\` 
            FOREIGN KEY (\`cartId\`) REFERENCES \`carts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`cart_items\` 
            ADD CONSTRAINT \`FK_cart_items_service\` 
            FOREIGN KEY (\`serviceId\`) REFERENCES \`services\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`cart_items\` 
            ADD CONSTRAINT \`FK_cart_items_product\` 
            FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`transactions\` 
            ADD CONSTRAINT \`FK_transactions_cart\` 
            FOREIGN KEY (\`cartId\`) REFERENCES \`carts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE \`receipts\` 
            ADD CONSTRAINT \`FK_receipts_cart\` 
            FOREIGN KEY (\`cartId\`) REFERENCES \`carts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        await queryRunner.query(`ALTER TABLE \`receipts\` DROP FOREIGN KEY \`FK_receipts_cart\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_transactions_cart\``);
        await queryRunner.query(`ALTER TABLE \`cart_items\` DROP FOREIGN KEY \`FK_cart_items_product\``);
        await queryRunner.query(`ALTER TABLE \`cart_items\` DROP FOREIGN KEY \`FK_cart_items_service\``);
        await queryRunner.query(`ALTER TABLE \`cart_items\` DROP FOREIGN KEY \`FK_cart_items_cart\``);

        // Drop tables
        await queryRunner.query(`DROP TABLE \`receipts\``);
        await queryRunner.query(`DROP TABLE \`transactions\``);
        await queryRunner.query(`DROP TABLE \`cart_items\``);
        await queryRunner.query(`DROP TABLE \`carts\``);
    }
}
