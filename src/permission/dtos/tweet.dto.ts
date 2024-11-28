import { Field, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { TweetCategory } from '../entities/tweet.entity';
import { User } from './user.dto';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

registerEnumType(TweetCategory, {
  name: 'TweetCategory', // This name must match the one in the schema
});

@InputType()
export class CreateTweetInput {
  @Field()
  @IsUUID('4')
  authorId: string;

  @Field()
  @IsString()
  content: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({each:true})
  @IsOptional()
  hashtags?: string[];

  @Field(() => String, { nullable: true })
  @IsUUID('4')
  @IsOptional()
  parentTweetId?: string;

  @Field(() => TweetCategory, { nullable: true })
  @IsOptional()
  @IsEnum(TweetCategory)
  category?: TweetCategory;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  location?: string;
}

@ObjectType()
export class Tweet {
  @Field()
  id: string;

  @Field()
  content: string;

  @Field(() => User)
  author: User;

  @Field(() => [String])
  hashtags?: string[];

  @Field(() => String, {nullable: true})
  parentTweetId?: string;

  @Field(() => TweetCategory, { nullable: true })
  category?: TweetCategory;

  @Field({ nullable: true })
  location?: string;

  @Field()
  createdAt: Date;
}


@InputType()
export class PaginationInput {
  @Field(() => Int)
  @IsNumber()
  limit: number;

  @Field(() => Int)
  @IsNumber()
  page: number;
}

@ObjectType()
export class PaginatedTweet{
  @Field(() => [Tweet])
  nodes: Tweet[]

  @Field(() => Boolean)
  hasNextPage: boolean
}