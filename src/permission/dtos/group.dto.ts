import { InputType, ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from './user.dto';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateGroupInput {

  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsUUID('4', {each: true})
  @IsOptional()
  userIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsUUID('4', {each: true})
  @IsOptional()
  groupIds?: string[];
}


@ObjectType()
export class Group {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => [User], { nullable: true })
  users: User[];

  @Field(() => [Group], { nullable: true })
  groups: Group[];
}
@InputType()
export class UpdateGroupMembershipInput {
  @Field(() => String)
  @IsUUID()
  groupId: string;

  @Field(() => [String])
  @IsArray()
  @IsUUID('4',{ each: true })
  userIds: string[];
}
