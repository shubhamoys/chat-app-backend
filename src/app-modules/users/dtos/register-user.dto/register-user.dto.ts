import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EmailDTO } from '../email.dto/email.dto';
import { UserGenderEnum, UserRoleEnum } from 'src/constants/enums';

export class RegisterUserDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  bio: string;

  @IsObject()
  @ValidateNested()
  @Type(() => EmailDTO)
  email: EmailDTO;

  @IsEnum(UserGenderEnum)
  @IsOptional()
  gender: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(UserRoleEnum)
  @IsNotEmpty()
  role: string;
}
