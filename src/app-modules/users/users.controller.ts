import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUsersDTO } from './dtos/get-users.dto/get-users.dto';
import { UpdateUserDTO } from './dtos/update-user.dto/update-user.dto';
import { ParseMongoIdPipe } from 'src/shared/pipes/parse-mongo-id/parse-mongo-id.pipe';
import { CreateUserDTO } from './dtos/create-user.dto/create-user.dto';
import { RestrictUsersGuard } from 'src/shared/guards/restrictors/restrict-users/restrict-users.guard';
import { UserIdGuard } from 'src/shared/guards/validators/user-id/user-id.guard';
import { ErrorConstant } from 'src/constants/error';
import { User } from './models/user/user';
import { LoginUserDTO } from './dtos/login-user.dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RestrictUsersGuard)
  async getUsers(@Query() getUsersDTO: GetUsersDTO) {
    return await this.usersService.get(getUsersDTO);
  }

  @Post()
  @UseGuards()
  async createUser(@Body() createUserDTO: CreateUserDTO) {
    return await this.usersService.create(createUserDTO);
  }

  @Put()
  @UseGuards(UserIdGuard)
  async updateUser(@Body() updateUserDTO: UpdateUserDTO) {
    return await this.usersService.update(updateUserDTO);
  }

  @Delete()
  @UseGuards(UserIdGuard)
  async deleteUser(@Body('userId', ParseMongoIdPipe) userId: string) {
    return await this.usersService.delete(userId);
  }

  @Post('session')
  @UseGuards()
  async loginUser(@Body() loginUserDTO: LoginUserDTO) {
    const foundUser = await this.usersService.get({
      emailValue: loginUserDTO.emailValue,
      fields: 'password',
    });

    if (!foundUser?.totalCount) {
      throw new BadRequestException({
        error: ErrorConstant.INVALID_FIELD,
        msgVars: {
          field: 'emailValue',
        },
      });
    }

    if (
      !(await User.comparePassword(
        loginUserDTO.password,
        foundUser.users[0].password.hash,
      ))
    ) {
      throw new BadRequestException({
        error: ErrorConstant.INVALID_FIELD,
        msgVars: {
          field: 'password',
        },
      });
    }

    return (
      await this.usersService.get({
        emailValue: loginUserDTO.emailValue,
        populate: 'tokens',
      })
    ).users[0];
  }
}
