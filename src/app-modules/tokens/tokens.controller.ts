import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TokensService } from './tokens.service';
import { PermissionsService } from '../permissions/permissions.service';
import { RestrictTokensGuard } from 'src/shared/guards/restrictors/restrict-tokens/restrict-tokens.guard';
import { GetTokensDTO } from './dtos/get-tokens.dto/get-tokens.dto';
import { UserIdGuard } from 'src/shared/guards/validators/user-id/user-id.guard';
import { CreateTokenDTO } from './dtos/create-token.dto/create-token.dto';
import { TokenIdGuard } from 'src/shared/guards/validators/token-id/token-id.guard';
import { UpdateTokenDTO } from './dtos/update-token.dto/update-token.dto';
import { ParseMongoIdPipe } from 'src/shared/pipes/parse-mongo-id/parse-mongo-id.pipe';
import { ValidatePermissionDTO } from './dtos/validate-permission.dto/validate-permission.dto';

@Controller('tokens')
export class TokensController {
  constructor(
    private readonly tokensService: TokensService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Get()
  @UseGuards(RestrictTokensGuard)
  async getTokens(@Query() getTokensDTO: GetTokensDTO) {
    return await this.tokensService.get(getTokensDTO);
  }

  @Post()
  @UseGuards(UserIdGuard)
  async createToken(@Body() createTokenDTO: CreateTokenDTO) {
    return await this.tokensService.create(createTokenDTO);
  }

  @Put()
  @UseGuards(TokenIdGuard)
  async updateToken(@Body() updateTokenDTO: UpdateTokenDTO) {
    return await this.tokensService.update(updateTokenDTO);
  }

  @Delete()
  @UseGuards(TokenIdGuard)
  async deleteToken(@Body('tokenId', ParseMongoIdPipe) tokenId: string) {
    return await this.tokensService.delete(tokenId);
  }

  @Post('validate')
  async validateToken(@Body('hash') hash: string) {
    return await this.tokensService.validate(hash);
  }

  @Post('/permissions/validate')
  async validateTokenPermission(
    @Body() validatePermissionDTO: ValidatePermissionDTO,
  ) {
    return await this.permissionsService.validate(validatePermissionDTO);
  }
}
