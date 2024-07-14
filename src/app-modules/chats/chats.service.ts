import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './models/chat/chat';
import { ErrorConstant } from 'src/constants/error';
import { HelperService } from 'src/shared/helpers/helper/helper.service';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel('Chats')
    private readonly chatModel: Model<Chat>,
    private readonly helperService: HelperService,
  ) {}

  async get(query?: { [key: string]: any }) {
    let readQuery: {
      [key: string]: any;
    } = {};

    if (query.chatId) {
      readQuery._id = query.chatId;
    }

    if (query.chatIds) {
      readQuery._id = { $in: query.chatIds.split(',') };
    }

    if (query.participantIds) {
      readQuery.participantIds = { $in: query.participantIds.split(',') };
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

    let chats = await this.chatModel
      .find(readQuery)
      .populate('participantIds')
      .select(query.fields)
      .limit(limit)
      .sort(query.sort)
      .skip(skip)
      .exec();

    let totalCount = await this.chatModel.countDocuments(readQuery);

    return {
      totalCount,
      currentCount: chats.length,
      chats: (chats.length && chats) || null,
    };
  }

  async create(chat: { [key: string]: any }) {
    if (!chat?.participantIds) {
      throw new BadRequestException({
        error: ErrorConstant.MISSING_FIELD,
        msgVars: { field: 'participantIds' },
      });
    }

    if (chat.participantIds.length !== 2) {
      throw new BadRequestException({
        error: ErrorConstant.INVALID_FIELD,
        msgVars: { field: 'participantIds' },
      });
    }

    let foundChat = await this.chatModel
      .findOne({
        participantIds: { $all: chat.participantIds },
      })
      .exec();

    if (foundChat) {
      throw new BadRequestException({
        error: ErrorConstant.DUPLICATE_ENTITY,
        msgVars: { entity: 'Chat' },
      });
    }

    let newChat = new this.chatModel(chat);

    let validationErrors = newChat.validateSync();

    if (validationErrors) {
      let error =
        validationErrors.errors[Object.keys(validationErrors.errors)[0]]
          .message;

      throw new BadRequestException(this.helperService.getDbErr(error));
    }

    try {
      return await newChat.save();
    } catch (e) {
      throw new BadRequestException({
        error: ErrorConstant.UNKNOWN_ERROR,
        msgVars: {
          message: e,
        },
      });
    }
  }

  async update(chat: { [key: string]: any }) {
    let foundChat = await this.chatModel
      .findOne({
        _id: chat.chatId,
      })
      .exec();

    if (!foundChat) {
      throw new BadRequestException({
        error: ErrorConstant.INVALID_FIELD,
        msgVars: {
          field: 'chatId',
        },
      });
    }

    if (chat.participantIds) {
      foundChat.participantIds = chat.participantIds;
    }

    foundChat.timestamp.updatedAt = new Date().getTime();

    let validationErrors = foundChat.validateSync();

    if (validationErrors) {
      let error =
        validationErrors.errors[Object.keys(validationErrors.errors)[0]]
          .message;

      throw new BadRequestException(this.helperService.getDbErr(error));
    }

    return await foundChat.save();
  }

  async delete(chatId: string) {
    return await this.chatModel.findOneAndDelete({ _id: chatId });
  }
}
