import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';


// This is simple representation of user... also we can handle just by a string referenced to the users...
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
}
