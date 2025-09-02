import {
  IsString,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Target user ID is required' })
  @Matches(/^[a-f\d]{24}$/i, { message: 'Invalid user ID format' })
  toUserId: string;

  @IsString()
  @IsNotEmpty({ message: 'Message content is required' })
  @MinLength(1, { message: 'Message cannot be empty' })
  @MaxLength(1000, { message: 'Message cannot exceed 1000 characters' })
  content: string;
}
