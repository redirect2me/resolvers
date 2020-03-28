import Pino from 'pino';
import PinoCaller from 'pino-caller';

import config from './config';


const options:Pino.LoggerOptions = {
  // @ts-ignore
  level: config.get('logLevel'),
  name: process.env.npm_package_name || 'moven-newtrx',
  redact: ['err.request', 'err.response', 'req.headers.authorization'],
  timestamp: Pino.stdTimeFunctions.isoTime,
};

const logger: Pino.Logger = PinoCaller(
  Pino(options)
);

logger.info({ config: JSON.parse(config.toString()) }, 'Configuration loaded');

export {
  logger,
  options
}
