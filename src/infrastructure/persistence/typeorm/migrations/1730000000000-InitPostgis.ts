import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitPostgis1730000000000 implements MigrationInterface {
  name = 'InitPostgis1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);

    await queryRunner.query(`
      CREATE TABLE areas (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL,
        polygon geometry(Polygon, 4326) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX areas_polygon_gix ON areas USING GIST (polygon)`,
    );

    await queryRunner.query(`
      CREATE TABLE user_area_presence (
        user_id varchar(128) NOT NULL,
        area_id uuid NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, area_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE area_entry_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar(128) NOT NULL,
        area_id uuid NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
        entered_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX area_entry_logs_entered_at_idx ON area_entry_logs (entered_at DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX area_entry_logs_user_entered_idx ON area_entry_logs (user_id, entered_at DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS area_entry_logs`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_area_presence`);
    await queryRunner.query(`DROP TABLE IF EXISTS areas`);
  }
}
