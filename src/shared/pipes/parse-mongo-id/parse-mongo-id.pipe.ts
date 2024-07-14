import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ErrorConstant } from './../../../constants/error';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: any, { data }: ArgumentMetadata) {
    if (!/^[a-f0-9]{24}$/.test(value)) {
      throw new BadRequestException({
        error: ErrorConstant.INVALID_FIELD,
        msgVars: { field: data },
      });
    }

    return new String(value);
  }
}
