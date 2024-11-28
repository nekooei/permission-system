import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { TweetService } from '../services/tweet.service';
import { CreateTweetInput, PaginatedTweet, PaginationInput, Tweet } from '../dtos';

@Resolver(() => Tweet)
export class TweetResolver {
  constructor(private readonly tweetService: TweetService) {}

  @Mutation(() => Tweet)
  async createTweet(@Args('input') input: CreateTweetInput){
    return this.tweetService.createTweet(input);
  }

  @Query(() => PaginatedTweet)
  async getAllTweets(@Args('pagination') pagination: PaginationInput){

    return this.tweetService.getAllTweets(pagination);
  }
}
