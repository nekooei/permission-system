import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
import { User } from '../entities/user.entity';
import { CreateGroupInput } from '../dtos';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Tweet } from '../entities/tweet.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService
    ) {}

  async createGroup(input: CreateGroupInput): Promise<Group> {
    const group = this.groupRepository.create();

    if (input.userIds) {
      group.users = await this.userRepository.findBy({ id: In(input.userIds) });
    }

    group.title = input.title;

    if (input.groupIds) {
      group.subgroups = await this.groupRepository.findBy({ id: In(input.groupIds) });
    }

    return this.groupRepository.save(group);
  }

  async getAllGroups(): Promise<Group[]> {
    return this.groupRepository.find({ relations: ['users', 'subgroups'] })
  }

  async updateGroupMembership(
    groupId: string,
    userIds: string[]
  ): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['users'],
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Fetch users from the database
    const users = await this.userRepository.findBy({ id: In(userIds) });

    if (users.length !== userIds.length) {
      throw new Error('One or more users not found');
    }

    // Update group members
    group.users = users;
    await this.groupRepository.save(group);

    // Invalidate cached permissions for tweets associated with this group
    const tweetsUsingGroup = await this.tweetRepository
      .createQueryBuilder('tweet')
      .innerJoin('tweet.viewPermissionGroups', 'viewGroup', 'viewGroup.id = :groupId', { groupId })
      .innerJoin('tweet.editPermissionGroups', 'editGroup', 'editGroup.id = :groupId', { groupId })
      .select(['tweet.id'])
      .getMany();

    for (const tweet of tweetsUsingGroup) {
      await this.invalidatePermissionCache(tweet.id);
    }

    return group;
  }

  private async invalidatePermissionCache(tweetId: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys(`*:${tweetId}`);
    for (const key of cacheKeys) {
      await this.cacheManager.del(key);
    }
  }

}
