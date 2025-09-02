import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class UpdateFriendRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Status is required' })
  @Matches(/^(accepted|rejected)$/, {
    message: 'Status must be either accepted or rejected',
  })
  status: 'accepted' | 'rejected';
}
