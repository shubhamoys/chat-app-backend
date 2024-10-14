import { RestrictTokensGuard } from './restrict-tokens.guard';

describe('RestrictTokensGuard', () => {
  it('should be defined', () => {
    expect(new RestrictTokensGuard()).toBeDefined();
  });
});
