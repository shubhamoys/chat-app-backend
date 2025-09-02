import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetFriendRequestsQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^(pending|accepted|rejected)$/, {
    message: 'Status must be one of: pending, accepted, rejected',
  })
  status?: 'pending' | 'accepted' | 'rejected' = 'pending';

  @IsOptional()
  @IsString()
  @Matches(/^(sent|received)$/, {
    message: 'Type must be one of: sent, received',
  })
  type?: 'sent' | 'received' = 'received';

  @IsOptional()
  @IsString()
  @Matches(/^(mrc|mru)$/, {
    message: 'Sort must be: mrc or mru',
  })
  sort?: 'mrc' | 'mru' = 'mrc';

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
  @Matches(/^(from|to|from,to|to,from)$/, {
    message: 'Populate must be: from, to, or from,to',
  })
  populate?: string;
}
