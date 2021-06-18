require('source-map-support').install(); // Required for using source-maps with logging

//import { promises as dnsPromises } from 'dns';
import Handlebars from 'handlebars';
import Koa from 'koa';
const flash = require('koa-better-flash');
import KoaBody from 'koa-body';
import KoaPinoLogger from 'koa-pino-logger';
import KoaSession from 'koa-session';
import KoaStatic from 'koa-static';
import KoaViews from 'koa-views';
import * as path from 'path';
import * as punycode from 'punycode';
import * as transliteration from 'transliteration';

import config from './config';
import * as asn from './data/maxmindData';
import { resolverRouter } from './routers/resolverRouter';
import { domainRouter } from './routers/domainRouter';
import { httpRouter } from './routers/httpRouter';
import { ipRouter } from './routers/ipRouter';
import { logger, options as loggerOptions } from './logger';
import { cryptoRouter } from './routers/cryptoRouter';
import { datagenRouter } from './routers/datagenRouter';
import { dnsRouter } from './routers/dnsRouter';
import * as resolvers from './data/resolverData';
import { rootRouter } from './routers/rootRouter';
import { infoRouter } from './routers/infoRouter';
import * as domains from './data/domainData';
import * as util from './util';

process.on('unhandledRejection', err => {
    logger.error({ err }, 'unhandledRejection');
});

const app = new Koa();

app.proxy = true
app.use(KoaPinoLogger(loggerOptions));
app.use(KoaBody({
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


function displayFlash(ctx:Koa.Context):Handlebars.SafeString|string {
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

    return new Handlebars.SafeString(retVal);
}
Handlebars.registerHelper('flash', displayFlash);

app.use(KoaViews(path.join(__dirname, '..', 'views'), {
    autoRender: false,
    map: { hbs: 'handlebars' },
    options: {
        helpers: {
            'arrayToHtml': function (lines: any): Handlebars.SafeString {
              let retVal = "";
              for (const line of lines) {
                retVal += Handlebars.escapeExpression(line) + "<br/>";
              }
              return new Handlebars.SafeString(retVal);
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
            toIso: function(d:Date) { return d ? d.toISOString() : '(none)'; },
            toJson: function(context:any) { return JSON.stringify(context, null, 2); },
            'toUpper': function (a: any) {
              return a ? a.toString().toUpperCase() : "";
            },
            toPunycode: function(domain:string) { return domain ? punycode.toASCII(domain) : '(null)'; },
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

rootRouter.get('/resolvers/', async (ctx) => {
  ctx.redirect('/resolvers/index.html');
});

rootRouter.get('/resolvers/index.html', async (ctx:any) => {
  ctx.body = await ctx.render('resolvers-index.hbs', {
    title: 'Open DNS Resolver List',
    resolvers: resolvers.getAll(ctx.request.query.draft).sort((a, b) => {
      if (a.name > b.name) {
        return 1;
      } else if (a.name < b.name) {
        return -1;
      }
      return 0;
    })
  });
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


async function main() {

  asn.initialize(logger);

  domains.initialize(logger);

  await resolvers.initialize(logger);

  const port = config.get('port');

  app.listen(port);

  logger.info({ port: port }, 'server running');
}

main();
