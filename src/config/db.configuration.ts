import { registerAs } from '@nestjs/config';

export default registerAs('db', () => {
  let config = {
    localhost: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: process.env.DB_NAME + '-local',
      options: {
        useNewUrlParser: process.env.NEW_URL_PARSER,
        useUnifiedTopology: process.env.UNIFIED_TOPOLOGY,
        useCreateIndex: process.env.CREATE_INDEX,
      },
    },
    dev: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: process.env.DB_NAME + '-dev',
      options: {
        useNewUrlParser: process.env.NEW_URL_PARSER,
        useUnifiedTopology: process.env.UNIFIED_TOPOLOGY,
        useCreateIndex: process.env.CREATE_INDEX,
      },
    },
    test: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: process.env.DB_NAME + '-test',
      options: {
        useNewUrlParser: process.env.NEW_URL_PARSER,
        useUnifiedTopology: process.env.UNIFIED_TOPOLOGY,
        useCreateIndex: process.env.CREATE_INDEX,
      },
    },
    production: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: process.env.DB_NAME + '-prod',
      options: {
        useNewUrlParser: process.env.NEW_URL_PARSER,
        useUnifiedTopology: process.env.UNIFIED_TOPOLOGY,
        useCreateIndex: process.env.CREATE_INDEX,
      },
    },
  };

  console.log(process.env.APP_ENV);
  return config[process.env.APP_ENV || 'dev'] || config['dev'];
});
