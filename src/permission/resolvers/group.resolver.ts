import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { GroupService } from '../services/group.service';
import { Group, CreateGroupInput, UpdateGroupMembershipInput } from '../dtos';
import { Group as GroupEntity } from '../entities/group.entity'

@Resolver(() => Group)
export class GroupResolver {
  constructor(private readonly groupService: GroupService) {}
  @Mutation(() => Group)
  async updateGroupMembership(
    @Args('input') input: UpdateGroupMembershipInput
  ) {
    return this.groupService.updateGroupMembership(input.groupId, input.userIds);
  }
  @Mutation(() => Group)
  async createGroup(@Args('input') input: CreateGroupInput) {
    return this.groupService.createGroup(input);
  }

  @Query(() => [Group])
  async getAllGroups() {
    return this.groupService.getAllGroups();
  }
}
