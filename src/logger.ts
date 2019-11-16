import Pino from 'pino';
import PinoCaller from 'pino-caller';

import config from './config';

function MovenUserReqSerializer(req: any): any {
  //console.log("SERIALIZING REQ");

  const result:any = Pino.stdSerializers.req(req);


  if (req.user) {
    //console.log("SERIALIZING REQ USER");
    result.user = req.user;
  }

  return result;
}

const serializers:any = {
  err: Pino.stdSerializers.err,
  req: MovenUserReqSerializer,
  res: Pino.stdSerializers.res,
};

//serializers[Symbol.for('pino.*')] = MovenAuthContextAndTraceElevator;

const options = {
  // @ts-ignore
  level: config.get('logLevel'),
  name: process.env.npm_package_name || 'moven-newtrx',
  redact: ['err.request', 'err.response', 'req.headers.authorization'],
  serializers,
  timestamp: () => `,"time":"${new Date().toISOString()}"`, // So it looks like bunyan
};

const logger: Pino.Logger = PinoCaller(
  Pino(options)
);

logger.info({ config: JSON.parse(config.toString()) }, 'Configuration loaded');

export {
  logger,
  options
}
