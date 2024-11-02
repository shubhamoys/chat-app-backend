import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PermissionsService } from '../permissions/permissions.service';
import { HelperService } from 'src/shared/helpers/helper/helper.service';
import { GetUsersDTO } from './dtos/get-users.dto/get-users.dto';
import { UpdateUserDTO } from './dtos/update-user.dto/update-user.dto';
import { ParseMongoIdPipe } from 'src/shared/pipes/parse-mongo-id/parse-mongo-id.pipe';
import { RegisterUserDTO } from './dtos/register-user.dto/register-user.dto';
import { LoginUserDTO } from './dtos/login-user.dto/login-user.dto';
import { ErrorConstant } from 'src/constants/error';
import { User } from './models/user/user';
import { RestrictUsersGuard } from 'src/shared/guards/restrictors/restrict-users/restrict-users.guard';
import { UserIdGuard } from 'src/shared/guards/validators/user-id/user-id.guard';
import { ResourceConstant } from 'src/constants/resources';
import { TokensService } from '../tokens/tokens.service';
import { LogoutUserDTO } from './dtos/logout-user.dto/logout-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly permissionsService: PermissionsService,
    private readonly tokensService: TokensService,
    private readonly helperService: HelperService,
  ) {}

  @Get()
  @UseGuards(RestrictUsersGuard)
  async getUsers(@Query() getUsersDTO: GetUsersDTO) {
    return await this.usersService.get(getUsersDTO);
  }

  @Post()
  async registerUser(@Body() registerUserDTO: RegisterUserDTO) {
    registerUserDTO.role = 'USER';
    return await this.usersService.create(registerUserDTO);
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

  @Post('session/login')
  @UseGuards()
  async loginUser(@Body() loginUserDTO: LoginUserDTO) {
    const foundUser = await this.usersService.get({
      emailValue: loginUserDTO.emailValue,
      fields: 'password,role',
    });

    if (!foundUser?.totalCount) {
      throw new BadRequestException({
        error: ErrorConstant.INVALID_FIELD,
        msgVars: {
          field: 'email',
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

    const foundToken = await this.tokensService.get({
      userId: foundUser.users[0]._id,
    });

    if (!foundToken?.totalCount) {
      await this.usersService.createUserToken(foundUser.users[0]);
    }

    return (
      await this.usersService.get({
        emailValue: loginUserDTO.emailValue,
        populate: 'tokens',
      })
    ).users[0];
  }

  @Post('session/logout')
  @UseGuards()
  async logoutUser(
    @Headers('authorization') authHeader: string,
    @Body() logoutUserDTO: LogoutUserDTO,
  ) {
    const tokenHash = authHeader.split(' ')[1];

    const foundUser = await this.usersService.get({
      emailValue: logoutUserDTO.emailValue,
    });

    if (!foundUser?.totalCount) {
      throw new BadRequestException({
        error: ErrorConstant.INVALID_FIELD,
        msgVars: {
          field: 'email',
        },
      });
    }

    const foundToken = await this.tokensService.get({
      hash: tokenHash,
      userId: foundUser.users[0]._id,
    });

    if (!foundToken?.totalCount) {
      throw new BadRequestException({
        error: ErrorConstant.INVALID_FIELD,
        msgVars: {
          field: 'token',
        },
      });
    }

    await this.tokensService.delete(foundToken.tokens[0]._id);

    return (
      await this.usersService.get({
        email: logoutUserDTO.emailValue,
        populate: 'tokens',
      })
    ).users[0];
  }
}
