import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorConstant } from 'src/constants/error';
import { HelperService } from 'src/shared/helpers/helper/helper.service';
import { Permission } from './models/permission/permission';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel('Permissions')
    private readonly permissionModel: Model<Permission>,
    private readonly helperService: HelperService,
  ) {}

  async get(query?: { [key: string]: any }) {
    let readQuery: { [key: string]: any } = {};

    if (query.permissionId) {
      readQuery._id = query.permissionId;
    }

    if (query.permissionIds) {
      readQuery._id = { $in: query.permissionIds.split(',') };
    }

    if (query.userId) {
      readQuery.userId = query.userId;
    }

    if (query.resourceId) {
      readQuery.resourceId = query.resourceId;
    }

    if (query.resourceName) {
      readQuery.resourceName = query.resourceName;
    }

    if (query.resourceAction) {
      readQuery.resourceAction = query.resourceAction;
    }

    if (query.restriction) {
      readQuery.restriction = query.restriction;
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

    let permissions = await this.permissionModel
      .find(readQuery)
      .select(query.fields)
      .limit(limit)
      .sort(query.sort)
      .skip(skip)
      .exec();

    let totalCount = await this.permissionModel.countDocuments(readQuery);

    return {
      totalCount,
      currentCount: permissions.length,
      permissions: (permissions.length && permissions) || null,
    };
  }

  async create(permission: { [key: string]: any }) {
    if (
      !permission?.resourceId ||
      !permission?.resourceName ||
      !permission?.resourceAction
    ) {
      throw new BadRequestException({
        error: ErrorConstant.MISSING_FIELD,
        msgVars: { field: 'resourceId or resourceName or resourceAction' },
      });
    }

    let foundPermission = await this.permissionModel
      .findOne({
        resourceId: permission.resourceId,
        resourceName: permission.resourceName,
        resourceAction: permission.resourceAction,
      })
      .exec();

    if (foundPermission) {
      throw new BadRequestException({
        error: ErrorConstant.DUPLICATE_ENTITY,
        msgVars: { entity: 'permission' },
      });
    }

    let newPermission = new this.permissionModel(permission);

    let validationErrors = newPermission.validateSync();

    if (validationErrors) {
      let error =
        validationErrors.errors[Object.keys(validationErrors.errors)[0]]
          .message;

      throw new BadRequestException(this.helperService.getDbErr(error));
    }

    try {
      return await newPermission.save();
    } catch (e) {
      throw new BadRequestException({
        error: ErrorConstant.DUPLICATE_ENTITY,
        msgVars: {
          entity: 'Permission',
        },
      });
    }
  }

  async createMany(permissions: Array<{ [key: string]: any }>) {
    await this.permissionModel.deleteMany({
      resourceId: permissions[0].resourceId,
      resourceName: permissions[0].resourceName,
    });

    return await this.permissionModel.insertMany(permissions);
  }

  async delete(permissionId: string) {
    return await this.permissionModel.findOneAndDelete({ _id: permissionId });
  }

  async deleteBy(query: { [key: string]: any }) {
    const permissions = await this.permissionModel.find(query).exec();

    for (const permission of permissions) {
      await this.delete(permission._id);
    }

    return null;
  }

  async validate(query: { [key: string]: any }) {
    let foundPermission = await this.permissionModel.findOne(query).exec();

    if (!foundPermission) {
      throw new BadRequestException({
        error: ErrorConstant.INVALID_FIELD,
        msgVars: {
          field: 'resourceAction',
        },
      });
    }

    return foundPermission;
  }
}
