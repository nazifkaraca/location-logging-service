import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AreaOrmEntity } from './area.orm-entity';

@Entity({ name: 'area_entry_logs' })
@Index('area_entry_logs_entered_at_idx', ['enteredAt'])
@Index('area_entry_logs_user_entered_idx', ['userId', 'enteredAt'])
@Index('area_entry_logs_area_entered_idx', ['areaId', 'enteredAt'])
export class AreaEntryLogOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128, name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'area_id' })
  areaId: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'entered_at' })
  enteredAt: Date;

  @ManyToOne(() => AreaOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'area_id' })
  area: AreaOrmEntity;
}
