import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateLiveCamStreamsTable1729000000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'live_cam_streams',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'store_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'pet_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'service_context_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
            comment: 'ID do agendamento/OS relacionado (opcional)',
          },
          {
            name: 'stream_url',
            type: 'varchar',
            length: '500',
            isNullable: false,
            comment: 'URL pública do player (sem credenciais)',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ONLINE', 'OFFLINE', 'EXPIRED'],
            default: "'ONLINE'",
            isNullable: false,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
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
        ],
      }),
      true,
    );

    // FKs
    await queryRunner.createForeignKey(
      'live_cam_streams',
      new TableForeignKey({
        columnNames: ['store_id'],
        referencedTableName: 'stores',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'live_cam_streams',
      new TableForeignKey({
        columnNames: ['pet_id'],
        referencedTableName: 'pets',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Índices
    await queryRunner.createIndex(
      'live_cam_streams',
      new TableIndex({
        name: 'IDX_STREAM_PET_STATUS',
        columnNames: ['pet_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'live_cam_streams',
      new TableIndex({
        name: 'IDX_STREAM_EXPIRES',
        columnNames: ['expires_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('live_cam_streams');
  }
}





