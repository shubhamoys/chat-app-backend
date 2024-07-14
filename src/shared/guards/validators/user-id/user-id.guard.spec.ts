import { UserIdGuard } from './user-id.guard';

describe('UserIdGuard', () => {
  it('should be defined', () => {
    expect(new UserIdGuard()).toBeDefined();
  });
});
