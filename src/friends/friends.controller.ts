import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { GetFriendsQueryDto } from './dto/get-friends-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/schemas/user.schema';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  async getFriends(
    @Query() query: GetFriendsQueryDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.friendsService.getFriends(
      currentUser._id.toString(),
      query,
    );
  }

  @Delete(':friendId')
  async removeFriend(
    @Param('friendId') friendId: string,
    @CurrentUser() currentUser: User,
  ) {
    return await this.friendsService.removeFriend(
      currentUser._id.toString(),
      friendId,
    );
  }
}
