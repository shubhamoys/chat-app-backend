import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserGenderEnum } from 'src/constants/enums';

export class UpdateUserDTO {
  @IsMongoId()
  userId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  bio: string;

  @IsEnum(UserGenderEnum)
  @IsOptional()
  gender: string;
}
