import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutUserDTO {
  @IsNotEmpty()
  @IsString()
  emailValue: string;
}
