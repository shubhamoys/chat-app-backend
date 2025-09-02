import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/schemas/user.schema';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.messagesService.sendMessage(
      currentUser._id.toString(),
      sendMessageDto,
    );
  }

  @Get()
  async getMessages(
    @Query() query: GetMessagesQueryDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.messagesService.getMessages(
      currentUser._id.toString(),
      query,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() currentUser: User) {
    const count = await this.messagesService.getUnreadMessageCount(
      currentUser._id.toString(),
    );

    return {
      message: 'Unread count fetched successfully',
      data: {
        currentCount: null,
        totalCount: null,
        page: null,
        unreadCount: count,
      },
    };
  }
}
