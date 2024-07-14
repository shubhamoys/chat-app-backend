import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDTO {
  @IsMongoId()
  userId: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
