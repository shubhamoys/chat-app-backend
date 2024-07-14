import { PermissionSchema } from './permission.schema';

describe('PermissionSchema', () => {
  it('should be defined', () => {
    expect(new PermissionSchema()).toBeDefined();
  });
});
