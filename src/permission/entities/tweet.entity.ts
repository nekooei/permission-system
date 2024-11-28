import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn, ManyToMany, JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Group } from './group.entity';

export enum TweetCategory {
  Sport = 'Sport',
  Finance = 'Finance',
  Tech = 'Tech',
  News = 'News',
}

@Entity('tweets')
export class Tweet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.id)
  author: User;

  @Column({ nullable: true })
  parentTweetId: string;

  @Column('text', { array: true, nullable: true })
  hashtags: string[]; // Array of hashtags for the tweet

  @Column({ type: 'enum', enum: TweetCategory, nullable: true })
  category: TweetCategory; // Enum for category

  @Column({ nullable: true })
  location: string; // Location of the tweet

  @ManyToMany(() => User)
  @JoinTable({ name: 'tweet_view_permissions' })
  viewPermissions: User[];

  @ManyToMany(() => Group)
  @JoinTable({ name: 'tweet_view_permission_groups' })
  viewPermissionGroups: Group[];

  @ManyToMany(() => User)
  @JoinTable({ name: 'tweet_edit_permissions' })
  editPermissions: User[];

  @ManyToMany(() => Group)
  @JoinTable({ name: 'tweet_edit_permission_groups' })
  editPermissionGroups: Group[];

  @Column({ default: true })
  inheritViewPermissions: boolean;

  @Column({ default: true })
  inheritEditPermissions: boolean;

  @CreateDateColumn()
  createdAt: Date; // Automatically set when the tweet is created
}
