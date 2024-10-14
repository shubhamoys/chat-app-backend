import { Module } from '@nestjs/common';
import { HelperService } from './helpers/helper/helper.service';

@Module({
  providers: [HelperService],
  exports: [HelperService],
})
export class SharedModule {}
