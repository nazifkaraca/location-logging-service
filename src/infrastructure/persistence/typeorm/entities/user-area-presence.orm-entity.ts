import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { AreaOrmEntity } from './area.orm-entity';

@Entity({ name: 'user_area_presence' })
export class UserAreaPresenceOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 128, name: 'user_id' })
  userId: string;

  @PrimaryColumn({ type: 'uuid', name: 'area_id' })
  areaId: string;

  @ManyToOne(() => AreaOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'area_id' })
  area: AreaOrmEntity;
}
