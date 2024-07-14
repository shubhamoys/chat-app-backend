import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './models/message/message';
import { HelperService } from 'src/shared/helpers/helper/helper.service';
import { ErrorConstant } from 'src/constants/error';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel('Messages')
    private readonly messageModel: Model<Message>,
    private readonly helperService: HelperService,
  ) {}

  async get(query?: { [key: string]: any }) {
    let readQuery: {
      [key: string]: any;
    } = {};

    if (query.messageId) {
      readQuery._id = query.messageId;
    }

    if (query.messageIds) {
      readQuery._id = { $in: query.messageIds.split(',') };
    }

    if (query.senderId) {
      readQuery.senderId = query.senderId;
    }

    if (query.receiverId) {
      readQuery.receiverId = query.receiverId;
    }

    if (query.chatId) {
      readQuery.chatId = query.chatId;
    }

    if (query.content) {
      readQuery.content = query.content;
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

    let messages = await this.messageModel
      .find(readQuery)
      .populate('senderId')
      .populate('receiverId')
      .select(query.fields)
      .limit(limit)
      .sort(query.sort)
      .skip(skip)
      .exec();

    let totalCount = await this.messageModel.countDocuments(readQuery);

    return {
      totalCount,
      currentCount: messages.length,
      messages: (messages.length && messages) || null,
    };
  }

  async create(message: { [key: string]: any }) {
    let newMessage = new this.messageModel(message);

    let validationErrors = newMessage.validateSync();

    if (validationErrors) {
      let error =
        validationErrors.errors[Object.keys(validationErrors.errors)[0]]
          .message;

      throw new BadRequestException(this.helperService.getDbErr(error));
    }

    try {
      return await newMessage.save();
    } catch (e) {
      throw new BadRequestException({
        error: ErrorConstant.UNKNOWN_ERROR,
        msgVars: {
          message: e,
        },
      });
    }
  }

  async update(message: { [key: string]: any }) {
    let foundMessage = await this.messageModel
      .findOne({
        _id: message.messageId,
      })
      .exec();

    if (!foundMessage) {
      throw new BadRequestException({
        error: ErrorConstant.INVALID_FIELD,
        msgVars: {
          field: 'messageId',
        },
      });
    }

    if (message.senderId) {
      foundMessage.senderId = message.senderId;
    }

    if (message.receiverId) {
      foundMessage.receiverId = message.receiverId;
    }

    if (message.chatId) {
      foundMessage.chatId = message.chatId;
    }

    if (message.content) {
      foundMessage.content = message.content;
    }

    foundMessage.timestamp.updatedAt = new Date().getTime();

    let validationErrors = foundMessage.validateSync();

    if (validationErrors) {
      let error =
        validationErrors.errors[Object.keys(validationErrors.errors)[0]]
          .message;

      throw new BadRequestException(this.helperService.getDbErr(error));
    }

    return await foundMessage.save();
  }

  async delete(messageId: string) {
    return await this.messageModel.findOneAndDelete({ _id: messageId });
  }
}
