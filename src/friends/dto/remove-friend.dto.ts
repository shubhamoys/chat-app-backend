import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class RemoveFriendDto {
  @IsString()
  @IsNotEmpty({ message: 'Friend user ID is required' })
  @Matches(/^[a-f\d]{24}$/i, { message: 'Invalid user ID format' })
  friendUserId: string;
}