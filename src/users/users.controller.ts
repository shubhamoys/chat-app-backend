import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from './schemas/user.schema';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.usersService.register(registerUserDto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return await this.usersService.verifyEmail(verifyEmailDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto.username, loginDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsers(
    @Query() query: GetUsersQueryDto,
    @CurrentUser() currentUser: User,
  ) {
    // Automatically exclude the current user when searching for friends/users
    // unless specifically searching for the current user by ID
    if (!query.userId && !query.excludeUserId) {
      query.excludeUserId = currentUser._id.toString();
    }

    return await this.usersService.getUsers(query, currentUser._id.toString());
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    return await this.usersService.updateUser(
      currentUser._id.toString(),
      updateUserDto,
    );
  }
}
