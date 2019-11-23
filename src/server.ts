require('source-map-support').install(); // Required for using source-maps with logging

import { promises as dnsPromises } from 'dns';
import Handlebars from 'handlebars';
import Koa from 'koa';
const flash = require('koa-better-flash');
import KoaBody from 'koa-body';
import KoaPinoLogger from 'koa-pino-logger';
import KoaRouter from 'koa-router';
import KoaSession from 'koa-session';
import KoaStatic from 'koa-static';
import KoaViews from 'koa-views';
import * as os from 'os';
import * as path from 'path';
import * as psl from 'psl';

import config from './config';
import { logger, options as loggerOptions } from './logger';
import * as resolvers from './resolvers';
import * as streamer from './streamer';

const app = new Koa();

app.use(KoaPinoLogger(loggerOptions));
app.use(KoaBody());
app.use(KoaStatic("static"));
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
            'encodeURIComponent': function(a:any) {
                return encodeURIComponent(a)
            },
            'envtag': () => config.get('envTag'),
            'equals': function(a:any, b:any, block:any) {
                return a == b ? block.fn() : block.inverse(this);
            },
            // async startup problems 'flash': displayFlash,
            'for': function(from:number, to:number, incr:number, block:any) {
                let result = '';
                for (let loop = from; loop < to; loop += incr)
                    result += block.fn(loop);
                return result;
            },
            toIso: function(d:Date) { return d ? d.toISOString() : '(none)'; },
            toJson: function(context:any) { return JSON.stringify(context, null, 2); },
            'toUpper': function (a: any) {
              return a ? a.toString().toUpperCase() : "";
            },
        },
        partials: {
            above: path.join(__dirname, '..', 'partials', 'above'),
            below: path.join(__dirname, '..', 'partials', 'below')
        }
    }
}));

app.use(async(ctx, next) => {
  try {
      await next();
      const status = ctx.status || 404;
      if (status === 404) {
          ctx.status = 404;
          if (ctx.path.endsWith('.json')) {
            ctx.body = { message: 'Invalid url', success: false, url: ctx.url };
          } else {
            ctx.body = await ctx.render('404.hbs', { title: '404', h1: '404 - Page not found', url: ctx.req.url });
          }
      }
  } catch (err) {
      logger.error( { err, url: ctx.url }, '500 error');
      ctx.status = 500;
      if (ctx.path.endsWith('.json')) {
        ctx.body = { message: `Server error ${err.message}`, success: false };
      } else {
        ctx.body = await ctx.render('500.hbs', { title: 'Server Error', message: err.message });
      }
  }
});

const rootRouter = new KoaRouter();

rootRouter.get('/index.html', async (ctx) => {
    await ctx.redirect('/');
});

rootRouter.get('/', async (ctx:any) => {
  ctx.body = await ctx.render('index.hbs', {
    current_ip: ctx.ips.length > 0 ? ctx.ips[ctx.ips.length - 1] : ctx.ip,
    h1: 'Resolve.rs',
    title: 'Resolve.rs',
  });
});

rootRouter.get('/resolvers/', async (ctx) => {
  await ctx.redirect('/resolvers/index.html');
});

rootRouter.get('/resolvers/index.html', async (ctx:any) => {
  ctx.body = await ctx.render('resolvers-index.hbs', { 
    title: 'Open Resolver List', 
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

rootRouter.get('/resolvers/:resolver/', async (ctx) => {
  await ctx.redirect('index.html');
});

rootRouter.get('/resolvers/:resolver/index.html', async (ctx: any) => {

  const resolverData = resolvers.get(ctx.params.resolver);
  if (!resolverData) {
    ctx.flash('error', `Sorry, we don't have any info for an open resolver "${ctx.params.resolver}".`)
    ctx.redirect("/resolvers/index.html");
    return;
  }
  ctx.body = await ctx.render('resolvers-detail.hbs', {
    title: resolverData.name,
    titleimg: resolverData.icon,
    resolver: resolverData
  });
});

rootRouter.get('/dns-check.html', async (ctx:any) => {
  ctx.body = await ctx.render('dns-check.hbs', {
    hostname: ctx.query.hostname,
    title: 'DNS Check'
  });
});

async function reverseDns(dnsResolver:dnsPromises.Resolver, ip:string): Promise<string>{

  try {
    return (await dnsResolver.reverse(ip)).join(',');
  }
  catch (err) {
    return err.message;
  }
}

rootRouter.post('/dns-check.html', async (ctx:any) => {

  const hostname = ctx.request.body.hostname;
  if (!hostname) {
    ctx.flash('error', 'You must enter a hostname to check!');
    ctx.redirect('/dns-check.html');
    return;
  }

  if (!psl.isValid(hostname)) {
    ctx.flash('error', `${Handlebars.escapeExpression(hostname)} is not a valid hostname!`);
    ctx.redirect(`/dns-check.html?hostname=${encodeURIComponent(hostname)}`);
    return;
  }

  streamer.streamResponse(ctx, `DNS Check on ${hostname}`, async (stream) => {

    for (const resolver of resolvers.getAll()) {
      const dnsResolver = new dnsPromises.Resolver();
      dnsResolver.setServers(resolver.ipv4);
      stream.write(`<p>${resolver.name}: `);
      const results = await dnsResolver.resolve4(hostname);
      for (const result of results) {
        stream.write(`${result} `);
        stream.write(`(${ await reverseDns(dnsResolver, result)})`);
      }
    }
/*
    const result = await dnsPromises.resolve(hostname);

    stream.write("<details>");
    stream.write(`<summary>${JSON.stringify(result)}</summary>`);
    stream.write("<pre>");
    stream.write(JSON.stringify({}, null, 2));
    stream.write("</pre>");
    stream.write("</details>");
*/

    stream.write(`<div class="alert alert-info">`);
    stream.write(`Complete`);
    stream.write(`</div>`);

    stream.write(`<p><a class="btn btn-primary" href="/dns-check.html?hostname=${encodeURIComponent(hostname)}">Continue</a>`);
  });
});

rootRouter.get('/sitemap.xml', async (ctx:any) => {

  const urls:string[] = [];

  urls.push("/");
  urls.push("/dns-check.html");
  urls.push("/resolvers/index.html");
  for (const resolver of resolvers.getAll()) {
    urls.push(`/resolvers/${resolver.key}/index.html`);
  }

  ctx.body = await ctx.render('sitemap.hbs', { urls });
  ctx.type = "text/xml;charset=utf-8";
});

rootRouter.get('/status.json', async (ctx) => {

    const retVal: {[key: string]: any} = {};

    retVal["success"] = true;
    retVal["message"] = "OK";
    retVal["timestamp"] = new Date().toISOString();
    retVal["tech"] = "NodeJS " + process.version;
    retVal["lastmod"] = process.env.LASTMOD || '(not set)';
    retVal["commit"] = process.env.COMMIT || '(not set)';
    retVal["__dirname"] = __dirname;
    retVal["__filename"] = __filename;
    retVal["os.hostname"] = os.hostname();
    retVal["os.type"] = os.type();
    retVal["os.platform"] = os.platform();
    retVal["os.arch"] = os.arch();
    retVal["os.release"] = os.release();
    retVal["os.uptime"] = os.uptime();
    retVal["os.loadavg"] = os.loadavg();
    retVal["os.totalmem"] = os.totalmem();
    retVal["os.freemem"] = os.freemem();
    retVal["os.cpus.length"] = os.cpus().length;
    // too much junk: retVal["os.networkInterfaces"] = os.networkInterfaces();

    retVal["process.arch"] = process.arch;
    retVal["process.cwd"] = process.cwd();
    retVal["process.execPath"] = process.execPath;
    retVal["process.memoryUsage"] = process.memoryUsage();
    retVal["process.platform"] = process.platform;
    retVal["process.release"] = process.release;
    retVal["process.title"] = process.title;
    retVal["process.uptime"] = process.uptime();
    retVal["process.version"] = process.version;
    retVal["process.versions"] = process.versions;

    retVal["resolvers"] = resolvers.getAll().length;

    const callback = ctx.request.query['callback'];
    if (callback && callback.match(/^[$A-Za-z_][0-9A-Za-z_$]*$/) != null) {
        ctx.body = callback + '(' + JSON.stringify(retVal) + ');';
    } else {
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Methods', 'POST, GET');
        ctx.set('Access-Control-Max-Age', '604800');
        ctx.body = retVal;
    }
});

rootRouter.get('/util/headers.json', async (ctx) => {
  ctx.body = ctx.request.headers;
});


app.use(rootRouter.routes());


async function main() {

  await resolvers.initialize(logger);

  const port = config.get('port');

  app.listen(port);

  logger.info({ port: port }, 'server running');
}

main();
