import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorConstant } from 'src/constants/error';
import { UsersService } from '../users/users.service';
import { PermissionsService } from '../permissions/permissions.service';
import { HelperService } from 'src/shared/helpers/helper/helper.service';
import { Token } from './models/token/token';
import { ResourceConstant } from 'src/constants/resources';

@Injectable()
export class TokensService {
  constructor(
    @InjectModel('Tokens') private readonly tokenModel: Model<Token>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly permissionsService: PermissionsService,
    private readonly helperService: HelperService,
  ) {}

  async get(query?: { [key: string]: any }) {
    let readQuery: {
      [key: string]: any;
    } = {};

    if (query.tokenId) {
      readQuery._id = query.tokenId;
    }

    if (query.tokenIds) {
      readQuery._id = { $in: query.tokenIds.split(',') };
    }

    if (query.userId) {
      readQuery.userId = query.userId;
    }

    if (query.name) {
      readQuery.name = {
        $regex: new RegExp(query.name, 'i'),
      };
    }

    if (query.description) {
      readQuery.description = {
        $regex: new RegExp(query.description, 'i'),
      };
    }

    if (query.hash) {
      readQuery.hash = query.hash;
    }

    // expected in msecs
    if (query.expiry) {
      readQuery.expiry = {
        $lte: new Date().getTime() + query.expiry,
      };
    }

    if (
      String(query.disabled).toLowerCase() === 'true' ||
      String(query.disabled).toLowerCase() === 'false'
    ) {
      readQuery.disabled = String(query.disabled).toLowerCase() === 'true';
    }

    readQuery.sort = { 'timestamp.createdAt': -1 };
    if (query.sort) {
      switch (query.sort) {
        case 'mrc': {
          readQuery.sort = { 'timestamp.createdAt': -1 };
          break;
        }

        case 'mru': {
          readQuery.sort = { 'timestamp.updatedAt': -1 };
          break;
        }

        case 'namea': {
          readQuery.sort = { name: 1 };
          break;
        }

        case 'named': {
          readQuery.sort = { name: -1 };
          break;
        }
      }
    }

    query.sort = readQuery.sort;
    delete readQuery.sort;

    let limit: number = !isNaN(query.limit)
      ? query.limit === -1
        ? 0
        : query.limit
      : 20;

    let page: number = !isNaN(query.page) ? query.page : 1;
    let skip = (page - 1) * limit;

    query.fields = query.fields
      ? query.fields
          .split(',')
          .reduce((a: any, b: any) => ((a[b] = true), a), {})
      : {};

    let tokens = await this.tokenModel
      .find(readQuery)
      .populate('permissions')
      .select(query.fields)
      .limit(limit)
      .sort(query.sort)
      .skip(skip)
      .exec();

    let totalCount = await this.tokenModel.countDocuments(readQuery);

    return {
      totalCount,
      currentCount: tokens.length,
      tokens: (tokens.length && tokens) || null,
    };
  }

  async create(token: { [key: string]: any }) {
    if (!token?.userId || !token?.name) {
      throw new BadRequestException({
        error: ErrorConstant.MISSING_FIELD,
        msgVars: { field: 'userId or name' },
      });
    }

    let foundToken = await this.tokenModel
      .findOne({
        userId: token.userId,
        name: token.name,
      })
      .exec();

    if (foundToken) {
      throw new BadRequestException({
        error: ErrorConstant.DUPLICATE_ENTITY,
        msgVars: { entity: 'Token' },
      });
    }

    let newToken = new this.tokenModel(token);

    newToken.hash = this.helperService.generateCode(32, 4, '-');

    let validationErrors = newToken.validateSync();

    if (validationErrors) {
      let error =
        validationErrors.errors[Object.keys(validationErrors.errors)[0]]
          .message;

      throw new BadRequestException(this.helperService.getDbErr(error));
    }

    try {
      const createdToken = await newToken.save();

      let permissions = [];

      let foundUser = (
        await this.usersService.get({
          userId: String(createdToken.userId),
        })
      ).users[0];

      for (let resource of Object.keys(ResourceConstant)) {
        if (
          !ResourceConstant[resource].roles ||
          !ResourceConstant[resource].roles[foundUser.role]
        ) {
          continue;
        }

        const perm = {
          userId: createdToken.userId,
          resourceId: createdToken._id,
          resourceName: 'Tokens',
          resourceAction: resource,
          restriction:
            ResourceConstant[resource].roles[foundUser.role].restriction,
        };

        permissions.push(perm);
      }

      await this.permissionsService.createMany(permissions);

      return createdToken;
    } catch (e) {
      throw new BadRequestException({
        error: ErrorConstant.DUPLICATE_ENTITY,
        msgVars: {
          entity: 'Token',
        },
      });
    }
  }

  async update(token: { [key: string]: any }) {
    let foundToken = await this.tokenModel.findOne({
      _id: token.tokenId,
    });

    if (!foundToken) {
      throw new BadRequestException({
        error: ErrorConstant.INVALID_FIELD,
        msgVars: {
          field: 'tokenId',
        },
      });
    }

    if (token.name) {
      foundToken.name = token.name;
    }

    if (!isNaN((token.expiry = parseInt(token.expiry)))) {
      foundToken.expiry = token.expiry;
    }

    if ('description' in token) {
      foundToken.description = token.description;
    }

    if (
      String(token.disabled).toLowerCase() === 'true' ||
      String(token.disabled).toLowerCase() === 'false'
    ) {
      foundToken.disabled = String(token.disabled).toLowerCase() === 'true';
    }

    foundToken.timestamp.updatedAt = new Date().getTime();

    let validationErrors = foundToken.validateSync();

    if (validationErrors) {
      let error =
        validationErrors.errors[Object.keys(validationErrors.errors)[0]]
          .message;

      throw new BadRequestException(this.helperService.getDbErr(error));
    }

    return await foundToken.save();
  }

  async updateBy(
    query: { [key: string]: any },
    update: { [key: string]: any },
  ) {
    const tokens = await this.tokenModel.find(query).exec();

    let updatedTokens = [];

    for (const token of tokens) {
      updatedTokens.push(
        await this.update({ tokenId: token._id, ...token, ...update }),
      );
    }

    return updatedTokens;
  }

  async delete(tokenId: string) {
    return await this.tokenModel.findOneAndDelete({ _id: tokenId });
  }

  async deleteBy(query: { [key: string]: any }) {
    const tokens = await this.tokenModel.find(query).exec();

    for (const token of tokens) {
      await this.delete(token._id);
    }

    return null;
  }

  async validate(hash: string) {
    if (!hash) {
      throw new BadRequestException({
        error: ErrorConstant.MISSING_FIELD,
        msgVars: { field: 'hash' },
      });
    }

    let validateQuery = {
      hash,
      $or: [{ expiry: { $gt: new Date().getTime() } }, { expiry: 0 }],
      disabled: false,
    };

    let token = await this.tokenModel.findOne(validateQuery).populate('userId');

    if (!token) {
      throw new ForbiddenException({
        error: ErrorConstant.INVALID_FIELD,
        msgVars: { field: 'hash' },
      });
    }

    return token;
  }
}
