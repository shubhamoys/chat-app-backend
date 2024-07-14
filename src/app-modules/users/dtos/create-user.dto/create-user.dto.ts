import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EmailDTO } from '../email.dto/email.dto';
import { PasswordDTO } from '../password.dto/password.dto';

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsObject()
  @ValidateNested()
  @Type(() => EmailDTO)
  email: EmailDTO;

  @IsObject()
  @ValidateNested()
  @Type(() => PasswordDTO)
  password: PasswordDTO;

  @IsString()
  @IsNotEmpty()
  role: string = 'USER';
}
