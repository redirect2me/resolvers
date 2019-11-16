import { PassThrough } from 'stream';
import * as Handlebars from 'handlebars';
import Koa from 'koa';

import { logger } from './logger';

let above:null|Handlebars.TemplateDelegate<any> = null;
let below:null|Handlebars.TemplateDelegate<any> = null;

async function streamResponse(ctx: Koa.BaseContext, title:string, fn:(s:PassThrough) => Promise<void>): Promise<any> {

  if (!above) {
    above = Handlebars.compile("{{>above}}");
  }
  if (!below) {
      below = Handlebars.compile("{{>below}}");
  }

  const notNullBelow = below;

  ctx.type = "text/html; charset=utf-8;"
  const stream = ctx.body = new PassThrough();

  stream.write(above({ title }));

  setImmediate(async () => {
    try {
      await fn(stream);
    }
    catch (err) {
      logger.error({ err, title }, 'error while streaming response');
      stream.write(`<div class="alert alert-danger">ERROR: ${err.message}</div>`);
    }
    stream.write(notNullBelow({}));
    stream.end();
  });
}

export {
  streamResponse
}