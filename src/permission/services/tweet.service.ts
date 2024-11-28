import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Tweet } from '../entities/tweet.entity';
import { CreateTweetInput, PaginatedTweet, PaginationInput, UpdateTweetPermissionsInput } from '../dtos';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { GraphQLException } from '@nestjs/graphql/dist/exceptions';

@Injectable()
export class TweetService {

  constructor(
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {

  }

  async updateTweetPermissions(updateData: UpdateTweetPermissionsInput): Promise<boolean> {
    const hasPermission = await this.canUserEditTweet(updateData.actorId, updateData.tweetId)
    if(!hasPermission){
      throw new GraphQLException('Permission Denied!', null)
    }
    const tweet = await this.tweetRepository.findOne({
      where: { id: updateData.tweetId },
    });

    if (!tweet) throw new Error('Tweet not found');

    // Update tweet permissions in the database
    if(updateData.inheritViewPermissions !== null)
      tweet.inheritViewPermissions = updateData.inheritViewPermissions;
    if(updateData.inheritEditPermissions !== null)
      tweet.inheritEditPermissions = updateData.inheritEditPermissions;
    if(updateData.viewPermissions)
      tweet.viewPermissions = await this.userRepository.findBy({ id: In(updateData.viewPermissions) });
    if(updateData.editPermissions)
      tweet.editPermissions = await this.userRepository.findBy({ id: In(updateData.editPermissions) });
    if(updateData.viewPermissionGroups)
      tweet.viewPermissionGroups = await this.groupRepository.findBy({ id: In(updateData.viewPermissionGroups) })
    if(updateData.editPermissionGroups)
      tweet.editPermissionGroups = await this.groupRepository.findBy({ id: In(updateData.editPermissionGroups) });
    await this.tweetRepository.save(tweet);

    // Invalidate cache for this tweet and any dependent tweets
    await this.invalidatePermissionCache(tweet.id);
    // invalidate child asynchronously
    this.invalidateChildPermissions(tweet.id).then(() => {
      // console.log('done!')
    }).catch(err => {
      // console.log(err)
    })

    if (tweet.inheritViewPermissions || tweet.inheritEditPermissions) {
      // Invalidate parent tweet cache if inherited permissions are enabled
      if (tweet.parentTweetId) {
        await this.invalidatePermissionCache(tweet.parentTweetId);
      }
    }



    return true;
  }

  private async invalidateChildPermissions(tweetId): Promise<void>{
    const childTweets = await this.tweetRepository.findBy({parentTweetId: tweetId})

    for (const childTweet of childTweets) {
      await this.invalidatePermissionCache(childTweet.id)
      await this.invalidateChildPermissions(childTweet.id)
    }


  }

  private async invalidatePermissionCache(tweetId: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys(`*:${tweetId}`);
    for (const key of cacheKeys) {
      await this.cacheManager.del(key);
    }
  }
  async canUserViewTweet(userId: string, tweetId: string): Promise<boolean> {
    const cacheKey = `canView:${userId}:${tweetId}`;
    const cachedResult = await this.cacheManager.get<boolean>(cacheKey);

    if (cachedResult !== null) {
      return cachedResult;
    }

    const result = await this.performViewPermissionCheck(userId, tweetId);

    // Cache the result
    await this.cacheManager.set(cacheKey, result); // Cache for 1 minute
    return result;
  }

  async canUserEditTweet(userId: string, tweetId: string): Promise<boolean> {
    const cacheKey = `canEdit:${userId}:${tweetId}`;
    const cachedResult = await this.cacheManager.get<boolean>(cacheKey);

    if (cachedResult !== null) {
      return cachedResult;
    }

    const result = await this.performEditPermissionCheck(userId, tweetId);

    // Cache the result
    await this.cacheManager.set(cacheKey, result); // Cache for 1 minute
    return result;
  }

  private async performViewPermissionCheck(userId: string, tweetId: string): Promise<boolean> {
    const tweet = await this.tweetRepository.findOne({
      where: { id: tweetId },
      relations: ['viewPermissions', 'viewPermissionGroups'],
    });

    if (!tweet) throw new Error('Tweet not found');

    let parentInPermissions = false
    if (tweet.inheritViewPermissions && tweet.parentTweetId) {
      parentInPermissions = await this.canUserViewTweet(userId, tweet.parentTweetId);
    }

    const userInPermissions = tweet.viewPermissions.some((user) => user.id === userId);

    const userGroups = await this.getUserGroups(userId);
    const groupInPermissions = tweet.viewPermissionGroups.some((group) =>
      userGroups.some((userGroup) => userGroup.id === group.id),
    );

    return userInPermissions || groupInPermissions || parentInPermissions;
  }

  private async performEditPermissionCheck(userId: string, tweetId: string): Promise<boolean> {
    const tweet = await this.tweetRepository.findOne({
      where: { id: tweetId },
      relations: ['editPermissions', 'editPermissionGroups'],
    });

    if (!tweet) throw new Error('Tweet not found');

    let parentInPermissions = false
    if (tweet.inheritEditPermissions && tweet.parentTweetId) {
      parentInPermissions = await this.canUserEditTweet(userId, tweet.parentTweetId);
    }

    const userInPermissions = tweet.editPermissions.some((user) => user.id === userId);

    const userGroups = await this.getUserGroups(userId);
    const groupInPermissions = tweet.editPermissionGroups.some((group) =>
      userGroups.some((userGroup) => userGroup.id === group.id),
    );

    return userInPermissions || groupInPermissions || parentInPermissions;
  }

  private async getUserGroups(userId: string): Promise<Group[]> {
    return this.groupRepository
      .createQueryBuilder('group')
      .innerJoin('group.users', 'user', 'user.id = :userId', { userId })
      .getMany();
  }


  async createTweet(input: CreateTweetInput): Promise<Tweet> {
    const tweet = this.tweetRepository.create(input);
    const author = await this.userRepository.findOneBy({ id: input.authorId });
    if(!author){
      throw new Error('Author not found!');
    }
    tweet.author = author;
    tweet.viewPermissions = [author]
    tweet.editPermissions = [author]

    const result = await this.tweetRepository.save(tweet);
    await this.invalidatePaginationCache();
    return result;
  }

  async getAllTweets(pagination: PaginationInput): Promise<PaginatedTweet> {
    const { limit, page } = pagination;
    const cacheKey = `tweets:pagination:limit=${limit}:page=${page}`;

    const cachedData = await this.cacheManager.get<PaginatedTweet>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    const [tweets, totalCount] = await this.tweetRepository.findAndCount({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['author'],
    });
    const result: PaginatedTweet = {
      nodes: tweets,
      hasNextPage: totalCount > page * limit,
    };
    await this.cacheManager.set(cacheKey, result);

    return result;

  }

  private async invalidatePaginationCache(): Promise<void> {
    // Find all keys for paginated tweets
    const cacheKeys = await this.cacheManager.store.keys('tweets:pagination:*');

    for (const key of cacheKeys) {
      await this.cacheManager.del(key);
    }
  }
}
