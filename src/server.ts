import handlebars from 'handlebars';
import Koa from 'koa';
import flash from 'koa-better-flash';
import { koaBody } from 'koa-body';
import KoaPinoLogger from 'koa-pino-logger';
import KoaSession from 'koa-session';
import KoaStatic from 'koa-static';
import KoaViews from '@ladjs/koa-views';
import { DateTime } from 'luxon';
import * as path from 'path';
import * as punycode from 'punycode';
import * as transliteration from 'transliteration';
import * as url from 'url';

import config from "./config.js";
import * as asn from "./data/maxmindData.js";
import { resolverRouter } from "./routers/resolverRouter.js";
import { domainRouter } from "./routers/domainRouter.js";
import { httpRouter } from "./routers/httpRouter.js";
import { ipRouter } from "./routers/ipRouter.js";
import { logger, options as loggerOptions } from "./logger.js";
import { cryptoRouter } from "./routers/cryptoRouter.js";
import { datagenRouter } from "./routers/datagenRouter.js";
import { dnsRouter } from "./routers/dnsRouter.js";
import { pslRouter, pslChangeLogRouter } from "./routers/pslRouter.js";
import * as resolvers from "./data/resolverData.js";
import { rootRouter } from "./routers/rootRouter.js";
import { tldsRouter, tldsChangeLogRouter } from "./routers/tldsRouter.js";
import { infoRouter } from "./routers/infoRouter.js";
import * as domains from "./data/domainData.js";
import * as rdapData from "./data/rdapData.js";
import * as util from "./util.js";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

process.on('unhandledRejection', err => {
    logger.error({ err }, 'unhandledRejection');
});

const app = new Koa();

app.proxy = true
app.use(KoaPinoLogger(loggerOptions));
app.use(koaBody({
    multipart: true,
  }));
app.use(KoaStatic("static", { maxage: 24 * 60 * 60 * 1000 }));
app.keys = [config.get('sessionKey')];
app.use(KoaSession({
    key: '_jsessionid',
    maxAge: 30 * 60 * 1000,
    renew: true
  }, app));
app.use(flash());
app.use(async (ctx, next) => {
  ctx.state.ctx = ctx;
  if (ctx.request.body.debug) {
      ctx.state.debug = true;
  } else if (ctx.query.debug) {
      ctx.state.debug = true;
  }
  ctx.state.build_id = config.get("buildId");
  await next();
});


function displayFlash(ctx:Koa.Context):handlebars.SafeString|string {
    if (!ctx) {
        return '';
    }

    let retVal = '';

    const msgs: { [key:string]: [string] } = ctx.flash();

    if (msgs['error']) {
        for (let msg of msgs['error']) {
            retVal += `<div class="alert alert-danger">${msg}</div>`;
        }
    }
    if (msgs['info']) {
        for (let msg of msgs['info']) {
            retVal += `<div class="alert alert-primary">${msg}</div>`;
        }
    }
    if (msgs['success']) {
        for (let msg of msgs['success']) {
            retVal += `<div class="alert alert-success">${msg}</div>`;
        }
    }
    if (msgs['warning']) {
        for (let msg of msgs['warning']) {
            retVal += `<div class="alert alert-warning">${msg}</div>`;
        }
    }

    return new handlebars.SafeString(retVal);
}
handlebars.registerHelper('flash', displayFlash);

app.use(KoaViews(path.join(__dirname, '..', 'views'), {
    autoRender: false,
    map: { hbs: 'handlebars' },
    options: {
        helpers: {
            'arrayToHtml': function (lines: any): handlebars.SafeString {
              let retVal = "";
              for (const line of lines) {
                retVal += handlebars.escapeExpression(line) + "<br/>";
              }
              return new handlebars.SafeString(retVal);
            },
            'encodeURIComponent': function(a:any) {
                return encodeURIComponent(a)
            },
            'equals': function(a:any, b:any, block:any) {
                return a == b ? block.fn(this) : block.inverse(this);
            },
            // async startup problems 'flash': displayFlash,
            'for': function(from:number, to:number, incr:number, block:any) {
                let result = '';
                for (let loop = from; loop < to; loop += incr)
                    result += block.fn(loop);
                return result;
            },
            fromPunycode: function(domain:string) { return domain ? punycode.toUnicode(domain) : '(null)'; },
            get: function (map: { [key: string]: any}, key:string) {
                return map[key];
            },
            ifDomainUnicode: function(context:any, options:any) { return context && !context.match(/^[a-z]+$/) ? options.fn(this) : options.inverse(this); },
            integerFormat: function(theNumber:any):string {
                if (theNumber == 0) {
                    return "0";
                }
                if (!theNumber) {
                    return "(invalid)";
                }
                return Number(theNumber).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                 });
            },
            isArray: function(target:any) {
                return target && Array.isArray(target);
            },
            length: function(target:any) {
                return target ? target.length : 0;
            },
            noCacheDev: function(multiParam:boolean) {
              if (process.env.COMMIT) {
                return '';
              }
              logger.debug({ multiParam }, 'multiParam');
              return `${multiParam ? '?' : '?'}nocache=${new Date().getTime()}`;
            },
            toIso: function(d:Date) { return d ? d.toISOString() : '(none)'; },
            toJson: function(context:any) { return JSON.stringify(context, null, 2); },
            'toUpper': function (a: any) {
              return a ? a.toString().toUpperCase() : "";
            },
            toPunycode: function(domain:string) { return domain ? punycode.toASCII(domain) : '(null)'; },
            toRFC2822: function(d:string) { return DateTime.fromISO(d).toRFC2822(); },
            transliterate: function(s:string) {
                return transliteration.slugify(s, {
                    allowedChars: 'a-zA-Z0-9',
                    trim: true,
                });
            },
        },
        partials: {
            above: path.join(__dirname, '..', 'partials', 'above'),
            below: path.join(__dirname, '..', 'partials', 'below')
        }
    }
}) as any);

app.use(async(ctx, next) => {
  try {
      if (ctx.path.endsWith('.html') || ctx.path == '/') {
          ctx.set('Permissions-Policy', 'interest-cohort=()');
      }
      await next();
      const status = ctx.status || 404;
      if (status === 404) {
          ctx.status = 404;
          if (ctx.path.endsWith('.json')) {
            util.handleJsonp(ctx, { message: 'Invalid url (404)', success: false, url: ctx.url });
          } else {
            ctx.body = await ctx.render('404.hbs', { title: '404', h1: '404 - Page not found', url: ctx.req.url });
          }
      }
  } catch (err) {
      logger.error( { err, url: ctx.url }, '500 error');
      ctx.status = 500;
      if (ctx.path.endsWith('.json')) {
        util.handleJsonp(ctx, { message: `Server error ${err.message}`, success: false });
      } else {
        ctx.body = await ctx.render('500.hbs', { title: 'Server Error', message: err.message });
      }
  }
});

app.use(rootRouter.routes());
app.use(resolverRouter.routes());
app.use(cryptoRouter.routes());
app.use(datagenRouter.routes());
app.use(dnsRouter.routes());
app.use(domainRouter.routes());
app.use(httpRouter.routes());
app.use(ipRouter.routes());
app.use(infoRouter.routes());
app.use(pslChangeLogRouter.routes());
app.use(pslRouter.routes());
app.use(tldsChangeLogRouter.routes());
app.use(tldsRouter.routes());

async function main() {

  asn.initialize(logger);

  domains.initialize(logger);
  rdapData.initialize(logger);

  await resolvers.initialize(logger);

  const port = config.get('port');

  app.listen(port);

  logger.info({ port: port }, 'server running');
}

main();
