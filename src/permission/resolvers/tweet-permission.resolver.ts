import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { TweetService } from '../services/tweet.service';
import { UpdateTweetPermissionsInput } from '../dtos';

@Resolver()
export class TweetPermissionResolver {
  constructor(private readonly tweetService: TweetService) {}
  @Mutation(() => Boolean)
  async updateTweetPermissions(
    @Args('input') input: UpdateTweetPermissionsInput,
  ): Promise<boolean> {
    return this.tweetService.updateTweetPermissions(input);
  }

  @Query(() => Boolean)
  async canEditTweet(
    @Args('userId') userId: string,
    @Args('tweetId') tweetId: string,
  ): Promise<boolean> {
    return this.tweetService.canUserEditTweet(userId, tweetId);
  }

  @Query(() => Boolean)
  async canViewTweet(
    @Args('userId') userId: string,
    @Args('tweetId') tweetId: string,
  ): Promise<boolean> {
    return this.tweetService.canUserViewTweet(userId, tweetId);
  }
}
