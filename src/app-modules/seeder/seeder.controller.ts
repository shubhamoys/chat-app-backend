import { BadRequestException, Controller, Post } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ErrorConstant } from 'src/constants/error';

@Controller('seeder')
export class SeederController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createSuperAdmin() {
    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    const foundUser = await this.usersService.get({ emailValue: email });

    if (foundUser?.totalCount) {
      throw new BadRequestException({
        error: ErrorConstant.DUPLICATE_ENTITY,
        msgVars: { entity: 'User' },
      });
    }

    const adminUserData = {
      name: name,
      email: { value: email },
      password: password,
      role: 'SUPER_ADMIN',
    };

    return await this.usersService.create(adminUserData);
  }
}
