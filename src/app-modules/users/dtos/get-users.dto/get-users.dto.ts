import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetUsersDTO {
  @IsMongoId()
  @IsOptional()
  userId: string;

  @IsString()
  @IsOptional()
  userIds: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  emailValue: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => String(value).toLowerCase() === 'true')
  emailVerified: boolean;

  @IsString()
  @IsOptional()
  role: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page: number;

  @IsOptional()
  @IsString()
  fields: string;

  @IsOptional()
  @IsString()
  sort: string;

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsString()
  populate: string;
}
