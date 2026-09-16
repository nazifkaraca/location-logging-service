import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EntryLogQuery, PaginatedEntryLogs } from '../../../domain/models';
import { EntryLogQueryPort } from '../../../domain/ports/entry-log-query.port';

@Injectable()
export class PostgresEntryLogQuery implements EntryLogQueryPort {
  constructor(private readonly dataSource: DataSource) {}

  async find(query: EntryLogQuery): Promise<PaginatedEntryLogs> {
    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;

    const filters: string[] = [];
    const params: unknown[] = [];

    const add = (sql: string, value: unknown) => {
      params.push(value);
      filters.push(sql.replace('?', `$${params.length}`));
    };

    if (query.userId) {
      add('user_id = ?', query.userId);
    }
    if (query.areaId) {
      add('area_id = ?', query.areaId);
    }
    if (query.from) {
      add('entered_at >= ?', query.from);
    }
    if (query.to) {
      add('entered_at <= ?', query.to);
    }

    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    const countRows = (await this.dataSource.query(
      `SELECT count(*)::int AS total FROM area_entry_logs ${where}`,
      params,
    )) as Array<{ total: number }>;

    const listParams = [...params, limit, offset];
    const limitPlaceholder = `$${params.length + 1}`;
    const offsetPlaceholder = `$${params.length + 2}`;

    const rows = (await this.dataSource.query(
      `
      SELECT id, user_id, area_id, entered_at
      FROM area_entry_logs
      ${where}
      ORDER BY entered_at DESC, id DESC
      LIMIT ${limitPlaceholder}
      OFFSET ${offsetPlaceholder}
      `,
      listParams,
    )) as Array<{
      id: string;
      user_id: string;
      area_id: string;
      entered_at: Date;
    }>;

    return {
      items: rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        areaId: row.area_id,
        enteredAt: row.entered_at,
      })),
      page,
      limit,
      total: countRows[0]?.total ?? 0,
    };
  }
}
