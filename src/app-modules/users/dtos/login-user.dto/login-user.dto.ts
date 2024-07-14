import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDTO {
  @IsNotEmpty()
  @IsString()
  emailValue: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
