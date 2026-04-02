import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Comment } from './comment.entity';

export enum AttachmentType {
  IMAGE = 'image',
  TEXT = 'text',
}

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  originalName: string;

  @Column({ length: 255 })
  fileName: string;

  @Column({ length: 500 })
  filePath: string;

  @Column({ length: 100 })
  mimeType: string;

  @Column()
  size: number;

  @Column({ type: 'enum', enum: AttachmentType })
  type: AttachmentType;

  @OneToOne(() => Comment, (comment) => comment.attachment)
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  @Column()
  commentId: number;
}
