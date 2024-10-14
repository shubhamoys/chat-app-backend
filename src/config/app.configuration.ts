import { registerAs } from '@nestjs/config';

export default registerAs('app', () => {
  let config = {
    localhost: {
      port: process.env.APP_PORT,
      uploadLimit: process.env.APP_UPLOAD_LIMIT + 'mb',
      env: process.env.APP_ENV,
      uiUrl: process.env.APP_UI_URL,
      aws: {
        s3: {
          buckets: {
            mediaBucket: process.env.AWS_BUCKET,
          },
          keys: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        },
      },
      email: {
        user: process.env.MAILER_USERNAME,
        pass: process.env.MAILER_PASSWORD,
        from: process.env.MAILER_FROM,
      },
    },
    dev: {
      port: process.env.APP_PORT,
      uploadLimit: process.env.APP_UPLOAD_LIMIT + 'mb',
      env: process.env.APP_ENV,
      uiUrl: process.env.APP_UI_URL,
      aws: {
        s3: {
          buckets: {
            mediaBucket: process.env.AWS_BUCKET,
          },
          keys: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        },
      },
      email: {
        user: process.env.MAILER_USERNAME,
        pass: process.env.MAILER_PASSWORD,
        from: process.env.MAILER_FROM,
      },
    },
    test: {
      port: process.env.APP_PORT,
      uploadLimit: process.env.APP_UPLOAD_LIMIT + 'mb',
      env: process.env.APP_ENV,
      uiUrl: process.env.APP_UI_URL,
      aws: {
        s3: {
          buckets: {
            mediaBucket: process.env.AWS_BUCKET,
          },
          keys: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        },
      },
      email: {
        user: process.env.MAILER_USERNAME,
        pass: process.env.MAILER_PASSWORD,
        from: process.env.MAILER_FROM,
      },
    },

    production: {
      port: process.env.APP_PORT,
      uploadLimit: process.env.APP_UPLOAD_LIMIT + 'mb',
      env: process.env.APP_ENV,
      uiUrl: process.env.APP_UI_URL,
      aws: {
        s3: {
          buckets: {
            mediaBucket: process.env.AWS_BUCKET,
          },
          keys: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        },
      },
      email: {
        user: process.env.MAILER_USERNAME,
        pass: process.env.MAILER_PASSWORD,
        from: process.env.MAILER_FROM,
      },
    },
  };

  console.log(process.env.APP_ENV);
  return config[process.env.APP_ENV || 'dev'] || config['dev'];
});
