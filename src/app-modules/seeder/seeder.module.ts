import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { SeederController } from './seeder.controller';
import { SeederService } from './seeder.service';

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [SeederService],
  exports: [SeederService],
  controllers: [SeederController],
})
export class SeederModule {}
