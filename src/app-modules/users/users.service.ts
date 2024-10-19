import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './models/user/user';
import { HelperService } from 'src/shared/helpers/helper/helper.service';
import { ErrorConstant } from 'src/constants/error';
import { Email } from './models/email/email';
import { Password } from './models/password/password';
import { TokensService } from '../tokens/tokens.service';
import { PermissionsService } from '../permissions/permissions.service';
import { ResourceConstant } from 'src/constants/resources';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('Users')
    private readonly userModel: Model<User>,
    private readonly helperService: HelperService,
    private readonly tokensService: TokensService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async get(query?: { [key: string]: any }) {
    let readQuery: { [key: string]: any } = {};

    if (query.userId) {
      readQuery._id = query.userId;
    }

    if (query.userIds) {
      readQuery._id = { $in: query.userIds.split(',') };
    }

    if (query.name) {
      readQuery.name = { $regex: new RegExp(query.name, 'i') };
    }

    if (query.bio) {
      readQuery.bio = { $regex: new RegExp(query.bio, 'i') };
    }

    if (query.emailValue) {
      readQuery['email.value'] = query.emailValue;
    }

    if (query.emailOTP) {
      readQuery['email.otp'] = query.emailOTP;
    }

    if (
      String(query.emailVerified) === 'true' ||
      String(query.emailVerified) === 'false'
    ) {
      readQuery['email.verified'] = String(query.emailVerified) === 'true';
    }

    if (query.gender) {
      readQuery.gender = {
        $regex: new RegExp(query.gender, 'i'),
      };
    }

    if (query.role) {
      readQuery.role = query.role;
    }

    if (query.search) {
      readQuery['$text'] = { $search: query.search };
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

    let users = await this.userModel
      .find(readQuery)
      .populate('tokens')
      .select(query.fields)
      .limit(limit)
      .sort(query.sort)
      .skip(skip)
      .populate(query.populate || '') // this is experimental field
      .exec();

    let totalCount = await this.userModel.countDocuments(readQuery);

    return {
      totalCount,
      currentCount: users.length,
      users: (users.length && users) || null,
    };
  }

  async create(user: { [key: string]: any }) {
    if (!user?.email?.value) {
      throw new BadRequestException({
        error: ErrorConstant.MISSING_FIELD,
        msgVars: { field: 'email.value' },
      });
    }

    let foundUser = await this.userModel
      .findOne({
        'email.value': user.email.value,
      })
      .exec();

    if (foundUser) {
      throw new BadRequestException({
        error: ErrorConstant.DUPLICATE_ENTITY,
        msgVars: { entity: 'User' },
      });
    }

    let newUser = new this.userModel(user);

    newUser.email = new Email();
    newUser.email.value = user.email.value;
    newUser.email.otp = null;
    newUser.email.verified = false;

    newUser.password = new Password();
    newUser.password.hash = await User.hashPassword(user.password);
    newUser.password.otp = null;
    newUser.password.reset = false;

    newUser.wasNew = true;

    let validationErrors = newUser.validateSync();

    if (validationErrors) {
      let error =
        validationErrors.errors[Object.keys(validationErrors.errors)[0]]
          .message;

      throw new BadRequestException(this.helperService.getDbErr(error));
    }

    try {
      return await newUser.save();
    } catch (e) {
      throw new BadRequestException({
        error: ErrorConstant.UNKNOWN_ERROR,
        msgVars: {
          message: e,
        },
      });
    }
  }

  async update(user: { [key: string]: any }) {
    let foundUser = await this.userModel
      .findOne({
        _id: user.userId,
      })
      .exec();

    if (!foundUser) {
      throw new BadRequestException({
        error: ErrorConstant.INVALID_FIELD,
        msgVars: {
          field: 'userId',
        },
      });
    }

    if (user.name) {
      foundUser.name = user.name;
    }

    if ('bio' in user) {
      foundUser.bio = user.bio;
    }

    if (user.email) {
      if (user.email.verified) {
        foundUser.email.verified = true;
        foundUser.email.otp = null;
      }

      if (foundUser.email.value !== user.email.value) {
        foundUser.email.value = user.email.value;
        foundUser.email.otp = this.helperService.generateCode(
          6,
          null,
          null,
          true,
        );
        foundUser.email.verified = false;
      }
    }

    if (user.gender) {
      foundUser.gender = user.gender;
    }

    if (user.password) {
      foundUser.password = user.password;
    }

    if (user.role) {
      foundUser.role = user.role;
    }

    foundUser.timestamp.updatedAt = new Date().getTime();

    foundUser.wasNew = false;

    let validationErrors = foundUser.validateSync();

    if (validationErrors) {
      let error =
        validationErrors.errors[Object.keys(validationErrors.errors)[0]]
          .message;

      throw new BadRequestException(this.helperService.getDbErr(error));
    }

    return await foundUser.save();
  }

  async delete(userId: string) {
    return await this.userModel.findOneAndDelete({ _id: userId });
  }

  async deleteBy(query: { [key: string]: any }) {
    const users = await this.userModel.find(query).exec();

    for (const user of users) {
      await this.delete(String(user._id));
    }

    return null;
  }

  async createUserToken(user: { [key: string]: any }) {
    let permissions = [];
    const token = await this.tokensService.create({
      userId: user._id,
      name: 'DEFAULT_TOKEN',
      expiry: Infinity,
      description: 'default token generated by system',
    });

    for (let resource of Object.keys(ResourceConstant)) {
      if (
        !ResourceConstant[resource].roles ||
        !ResourceConstant[resource].roles[user.role]
      ) {
        continue;
      }

      const perm = {
        userId: user._id,
        resourceId: token._id,
        resourceName: 'Tokens',
        resourceAction: resource,
        restriction: ResourceConstant[resource].roles[user.role].restriction,
      };

      permissions.push(perm);
    }

    const permission = await this.permissionsService.createMany(permissions);

    return permission;
  }
}
