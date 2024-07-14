import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { GetChatsDTO } from './dtos/get-chats.dto/get-chats.dto';
import { CreateChatDTO } from './dtos/create-chat.dto/create-chat.dto';
import { UpdateChatDTO } from './dtos/update-chat.dto/update-chat.dto';
import { ParseMongoIdPipe } from 'src/shared/pipes/parse-mongo-id/parse-mongo-id.pipe';
import { UserIdGuard } from 'src/shared/guards/validators/user-id/user-id.guard';
import { RestrictChatsGuard } from 'src/shared/guards/restrictors/restrict-chats/restrict-chats.guard';
import { ChatIdGuard } from 'src/shared/guards/validators/chat-id/chat-id.guard';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  @UseGuards(RestrictChatsGuard)
  async getChats(@Query() getChatsDTO: GetChatsDTO) {
    return await this.chatsService.get(getChatsDTO);
  }

  @Post()
  @UseGuards(UserIdGuard)
  async createChat(@Body() createChatDTO: CreateChatDTO) {
    return await this.chatsService.create(createChatDTO);
  }

  @Put()
  @UseGuards(ChatIdGuard)
  async updateChat(@Body() updateChatDTO: UpdateChatDTO) {
    return await this.chatsService.update(updateChatDTO);
  }

  @Delete()
  @UseGuards(ChatIdGuard)
  async deleteChat(@Body('chatId', ParseMongoIdPipe) chatId: string) {
    return await this.chatsService.delete(chatId);
  }
}
