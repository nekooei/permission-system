import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from './entities/tweet.entity';
import { User } from './entities/user.entity';
import { Group } from './entities/group.entity';
import { TweetService } from './services/tweet.service';
import { TweetResolver } from './resolvers/tweet.resolver';
import { GroupService } from './services/group.service';
import { GroupResolver } from './resolvers/group.resolver';
import { TweetPermissionResolver } from './resolvers/tweet-permission.resolver';


@Module({
  imports: [
    TypeOrmModule.forFeature([Tweet, User, Group])
  ],
  providers: [TweetService, TweetResolver, GroupService, GroupResolver, TweetPermissionResolver]
})
export class PermissionModule {}
