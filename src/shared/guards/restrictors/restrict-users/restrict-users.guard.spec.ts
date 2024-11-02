import { RestrictUsersGuard } from './restrict-users.guard';

describe('RestrictUsersGuard', () => {
  it('should be defined', () => {
    expect(new RestrictUsersGuard()).toBeDefined();
  });
});
