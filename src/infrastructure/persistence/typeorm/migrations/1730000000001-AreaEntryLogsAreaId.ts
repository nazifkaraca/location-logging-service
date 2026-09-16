import { MigrationInterface, QueryRunner } from 'typeorm';

export class AreaEntryLogsAreaId1730000000001 implements MigrationInterface {
  name = 'AreaEntryLogsAreaId1730000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX area_entry_logs_area_entered_idx ON area_entry_logs (area_id, entered_at DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS area_entry_logs_area_entered_idx`,
    );
  }
}
