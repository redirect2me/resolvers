import pino, { type Logger, type LoggerOptions } from 'pino';
//import PinoCaller from 'pino-caller';

import config from "./config.js";


const options: LoggerOptions = {
    serializers: pino.stdSerializers,
  // @ts-ignore
  level: config.get('logLevel'),
  name: process.env.npm_package_name || 'resolvers',
  redact: ['err.request', 'err.response', 'req.headers.authorization'],
  timestamp: pino.stdTimeFunctions.isoTime,
};

const logger: Logger = //PinoCaller(
  pino(options);
//);

logger.info({ config: JSON.parse(config.toString()) }, 'Configuration loaded');

export {
  logger,
  options
}
