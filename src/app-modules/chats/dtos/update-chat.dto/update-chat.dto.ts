import { IsArray, IsMongoId, ValidateIf } from 'class-validator';

export class UpdateChatDTO {
  @IsMongoId()
  chatId: string;

  @IsArray()
  @ValidateIf(
    (o) => Array.isArray(o.participantIds) && o.participantIds.length === 2,
    {
      message: 'Chat must have exactly two participants.',
    },
  )
  @IsMongoId({
    each: true,
    message: 'Each participant ID must be a valid MongoDB ObjectId.',
  })
  participantIds: string[];
}
