import { ChatSchema } from './chat.schema';

describe('ChatSchema', () => {
  it('should be defined', () => {
    expect(new ChatSchema()).toBeDefined();
  });
});
