import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class ValidatePermissionDTO {
  @IsMongoId()
  resourceId: string;

  @IsNotEmpty()
  @IsString()
  resourceName: string;

  @IsNotEmpty()
  @IsString()
  resourceAction: string;
}
