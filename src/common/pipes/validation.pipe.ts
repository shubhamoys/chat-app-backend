import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ERROR_CODES } from '../constants/response.constants';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => {
          return Object.values(error.constraints || {}).join(', ');
        })
        .join('; ');

      throw new BadRequestException({
        success: false,
        message: errorMessages,
        error: {
          code: ERROR_CODES.INVALID_FIELD,
          details: errors,
        },
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    const mongooseSchemaClasses = ['User', 'Message', 'Conversation', 'FriendRequest', 'VerificationToken'];
    return !types.includes(metatype) && !mongooseSchemaClasses.includes(metatype.name);
  }
}
