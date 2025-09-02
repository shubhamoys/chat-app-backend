import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { GetConversationsQueryDto } from './dto/get-conversations-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/schemas/user.schema';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  async getConversations(
    @Query() query: GetConversationsQueryDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.conversationsService.getConversations(
      currentUser._id.toString(),
      query,
    );
  }
}
