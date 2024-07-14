import { forwardRef, Module } from '@nestjs/common';
import { SeederController } from './seeder.controller';
import { SeederService } from './seeder.service';
import { UsersModule } from '../users/users.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [forwardRef(() => UsersModule), forwardRef(() => PermissionsModule)],
  controllers: [SeederController],
  providers: [SeederService],
})
export class SeederModule {}
