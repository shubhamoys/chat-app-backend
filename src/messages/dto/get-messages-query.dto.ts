import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  Matches,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetMessagesQueryDto {
  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsString()
  messageId?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(mrc|mru|oldest)$/, {
    message: 'Sort must be: mrc, mru, or oldest',
  })
  sort?: 'mrc' | 'mru' | 'oldest' = 'mrc';

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @IsString()
  fields?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(from|conversationId|from,conversationId|conversationId,from)$/, {
    message: 'Populate must be: from, conversationId, or from,conversationId',
  })
  populate?: string;
}
