import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PasswordDTO {
  @IsString()
  @IsNotEmpty()
  hash: string;

  @IsString()
  @IsOptional()
  otp: string;

  @IsBoolean()
  @IsOptional()
  reset: boolean;
}
