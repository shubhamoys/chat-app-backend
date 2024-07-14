import { Transform } from 'class-transformer';
import { IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetMessagesDTO {
  @IsMongoId()
  @IsOptional()
  messageId: string;

  @IsString()
  @IsOptional()
  messageIds: string;

  @IsMongoId()
  @IsOptional()
  senderId: string;

  @IsMongoId()
  @IsOptional()
  receiverId: string;

  @IsMongoId()
  @IsOptional()
  chatId: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page: number;

  @IsString()
  @IsOptional()
  fields: string;

  @IsString()
  @IsOptional()
  sort: string;

  @IsString()
  @IsOptional()
  search: string;

  @IsString()
  @IsOptional()
  populate: string;
}
