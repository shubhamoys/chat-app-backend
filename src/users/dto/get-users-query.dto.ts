import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetUsersQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-f\d]{24}$/i, { message: 'Invalid user ID format' })
  userId?: string;

  @IsOptional()
  @IsString()
  userIds?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isEmailVerified?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(mrc|mru|namea|named)$/, {
    message: 'Sort must be one of: mrc, mru, namea, named',
  })
  sort?: 'mrc' | 'mru' | 'namea' | 'named';

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
    message: 'Populate must be one of: friends',
  })
  populate?: string;
}
