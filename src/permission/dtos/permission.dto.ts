import { InputType, Field } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class UpdateTweetPermissionsInput {
  @Field()
  @IsUUID()
  actorId: string;


  @Field()
  @IsUUID()
  tweetId: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  inheritViewPermissions?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  inheritEditPermissions?: boolean;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsUUID('4',{ each: true })
  @IsOptional()
  viewPermissions?: string[]; // User IDs

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsUUID('4',{ each: true })
  @IsOptional()
  editPermissions?: string[]; // User IDs

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsUUID('4',{ each: true })
  @IsOptional()
  viewPermissionGroups?: string[]; // group IDs

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsUUID('4',{ each: true })
  @IsOptional()
  editPermissionGroups?: string[]; // group IDs

}
