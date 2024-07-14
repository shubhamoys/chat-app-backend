import { Transform } from 'class-transformer';
import { IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetChatsDTO {
  @IsMongoId()
  @IsOptional()
  chatId: string;

  @IsString()
  @IsOptional()
  chatIds: string;

  @IsString()
  @IsOptional()
  participantIds: string;

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
