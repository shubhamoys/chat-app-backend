import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EmailDTO {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsOptional()
  otp: string;

  @IsBoolean()
  @IsOptional()
  verified: boolean;
}
