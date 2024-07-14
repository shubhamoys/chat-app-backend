import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDTO {
  @IsMongoId()
  @IsNotEmpty()
  senderId: string;

  @IsMongoId()
  @IsNotEmpty()
  receiverId: string;

  @IsMongoId()
  @IsNotEmpty()
  chatId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
