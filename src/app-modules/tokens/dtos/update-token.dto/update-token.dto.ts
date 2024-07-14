import {
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateTokenDTO {
  @IsMongoId()
  tokenId: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsNumber()
  @IsOptional()
  expiry: number;

  @IsString()
  @IsOptional()
  description: string;

  @IsBoolean()
  @IsOptional()
  disabled: boolean;
}
