import { registerAs } from '@nestjs/config';

let config = {
  localhost: {
    port: 4102,
    uploadLimit: '250mb',
    env: 'localhost',
    uiUrl: 'http://localhost:8100',
    aws: {
      s3: {
        buckets: {
          mediaBucket: 'chat-app',
        },
        keys: {
          accessKeyId: '',
          secretAccessKey: '',
        },
      },
    },
    email: {
      user: '',
      pass: '',
      from: '',
    },
  },
  dev: {
    port: 4102,
    uploadLimit: '250mb',
    env: 'dev',
    uiUrl: 'http://localhost:8100',
    aws: {
      s3: {
        buckets: {
          mediaBucket: 'chat-app',
        },
        keys: {
          accessKeyId: '',
          secretAccessKey: '',
        },
      },
    },
    email: {
      user: '',
      pass: '',
      from: '',
    },
  },
  test: {
    port: 4111,
    uploadLimit: '250mb',
    env: 'test',
    uiUrl: 'http://localhost:8100',
    aws: {
      s3: {
        buckets: {
          mediaBucket: 'chat-app',
        },
        keys: {
          accessKeyId: '',
          secretAccessKey: '',
        },
      },
    },
    email: {
      user: '',
      pass: '',
      from: '',
    },
  },

  production: {
    port: 4102,
    uploadLimit: '250mb',
    env: 'prod',
    uiUrl: 'http://localhost:8100',
    aws: {
      s3: {
        buckets: {
          mediaBucket: 'chat-app',
        },
        keys: {
          accessKeyId: '',
          secretAccessKey: '',
        },
      },
    },
    email: {
      user: '',
      pass: '',
      from: '',
    },
  },
};

export default registerAs('app', () => {
  console.log(process.env.NODE_ENV, 'app.config');
  return config[process.env.NODE_ENV || 'dev'] || config['dev'];
});
