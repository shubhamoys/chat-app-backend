import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class SendFriendRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Target user ID is required' })
  @Matches(/^[a-f\d]{24}$/i, { message: 'Invalid user ID format' })
  toUserId: string;
}
