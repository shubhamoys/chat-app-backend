import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetTokensDTO {
  @IsMongoId()
  @IsOptional()
  tokenId: string;

  @IsString()
  @IsOptional()
  tokenIds: string;

  @IsMongoId()
  @IsOptional()
  userId: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  hash: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  expiry: number;

  @IsString()
  @IsOptional()
  description: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => String(value).toLowerCase() === 'true')
  disabled: boolean;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page: number;

  @IsString()
  @IsOptional()
  fields: string;

  @IsString()
  @IsOptional()
  sort: string;

  @IsString()
  @IsOptional()
  search: string;

  @IsString()
  @IsOptional()
  populate: string;
}
