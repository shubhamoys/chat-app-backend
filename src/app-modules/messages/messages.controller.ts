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
import { MessagesService } from './messages.service';
import { RestrictMessagesGuard } from 'src/shared/guards/restrictors/restrict-messages/restrict-messages.guard';
import { GetMessagesDTO } from './dtos/get-messages.dto/get-messages.dto';
import { ChatIdGuard } from 'src/shared/guards/validators/chat-id/chat-id.guard';
import { CreateMessageDTO } from './dtos/create-message.dto/create-message.dto';
import { MessageIdGuard } from 'src/shared/guards/validators/message-id/message-id.guard';
import { UpdateMessageDTO } from './dtos/update-message.dto/update-message.dto';
import { ParseMongoIdPipe } from 'src/shared/pipes/parse-mongo-id/parse-mongo-id.pipe';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @UseGuards(RestrictMessagesGuard)
  async getMessages(@Query() getMessagesDTO: GetMessagesDTO) {
    return await this.messagesService.get(getMessagesDTO);
  }

  @Post()
  @UseGuards(ChatIdGuard)
  async createMessage(@Body() createMessageDTO: CreateMessageDTO) {
    return await this.messagesService.create(createMessageDTO);
  }

  @Put()
  @UseGuards(MessageIdGuard)
  async updateMessage(@Body() updateMessageDTO: UpdateMessageDTO) {
    return await this.messagesService.update(updateMessageDTO);
  }

  @Delete()
  @UseGuards(MessageIdGuard)
  async deleteMessage(@Body('messageId', ParseMongoIdPipe) messageId: string) {
    return await this.messagesService.delete(messageId);
  }
}
