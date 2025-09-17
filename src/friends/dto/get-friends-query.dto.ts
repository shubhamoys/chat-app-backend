import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetFriendsQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^(mrc|mru|namea|named)$/, {
    message: 'Sort must be: mrc, mru, namea, or named',
  })
  sort?: 'mrc' | 'mru' | 'namea' | 'named' = 'mrc';

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
  @Matches(/^(friends)$/, {
    message: 'Populate must be: friends',
  })
  populate?: string;

  @IsOptional()
  @IsString()
  search?: string;
}