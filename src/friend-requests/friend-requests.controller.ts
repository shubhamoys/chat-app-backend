import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FriendRequestsService } from './friend-requests.service';
import { SendFriendRequestDto } from './dto/send-friend-request.dto';
import { GetFriendRequestsQueryDto } from './dto/get-friend-requests-query.dto';
import { UpdateFriendRequestDto } from './dto/update-friend-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/schemas/user.schema';

@Controller('friend-requests')
@UseGuards(JwtAuthGuard)
export class FriendRequestsController {
  constructor(private readonly friendRequestsService: FriendRequestsService) {}

  @Post()
  async sendFriendRequest(
    @Body() sendFriendRequestDto: SendFriendRequestDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.friendRequestsService.sendFriendRequest(
      currentUser._id.toString(),
      sendFriendRequestDto,
    );
  }

  @Get()
  async getFriendRequests(
    @Query() query: GetFriendRequestsQueryDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.friendRequestsService.getFriendRequests(
      currentUser._id.toString(),
      query,
    );
  }

  @Put(':requestId')
  async updateFriendRequest(
    @Param('requestId') requestId: string,
    @Body() updateFriendRequestDto: UpdateFriendRequestDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.friendRequestsService.updateFriendRequest(
      currentUser._id.toString(),
      requestId,
      updateFriendRequestDto,
    );
  }
}
