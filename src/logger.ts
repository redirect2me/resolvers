import { pino as Pino } from 'pino';
//import PinoCaller from 'pino-caller';

import config from "./config.js";


const options:Pino.LoggerOptions = {
    serializers: Pino.stdSerializers,
  // @ts-ignore
  level: config.get('logLevel'),
  name: process.env.npm_package_name || 'resolvers',
  redact: ['err.request', 'err.response', 'req.headers.authorization'],
  timestamp: Pino.stdTimeFunctions.isoTime,
};

const logger: Pino.Logger = //PinoCaller(
  Pino(options);
//);

logger.info({ config: JSON.parse(config.toString()) }, 'Configuration loaded');

export {
  logger,
  options
}
