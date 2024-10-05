import { PassThrough } from 'stream';
//import Koa from 'koa';

import { logger } from "./logger.js";

async function streamResponse(ctx: any, title:string, fn:(s:PassThrough) => Promise<void>): Promise<any> {

  ctx.type = "text/html; charset=utf-8;"
  const stream = ctx.body = new PassThrough();

  stream.write(await ctx.render("stream-above.hbs", { title }));

  setImmediate(async () => {
    try {
      await fn(stream);
    }
    catch (err) {
      logger.error({ err, title }, 'error while streaming response');
      stream.write(`<div class="alert alert-danger">ERROR: ${err.message}</div>`);
    }
    stream.write(await ctx.render("stream-below.hbs", {}));
    stream.end();
  });
}

export {
  streamResponse
}
