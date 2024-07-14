import { TokenSchema } from './token.schema';

describe('TokenSchema', () => {
  it('should be defined', () => {
    expect(new TokenSchema()).toBeDefined();
  });
});
