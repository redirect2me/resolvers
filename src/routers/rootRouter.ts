import Router from 'koa-router';
import * as asn from '../data/maxmindData';
import * as os from 'os';

import * as resolvers from '../data/resolverData';
import * as util from '../util';
import { getCurrentIP } from './ipRouter';
import { sitemap } from '../actions/sitemap';

const rootRouter = new Router();

rootRouter.get('/', async (ctx:any) => {
    const current_ip = getCurrentIP(ctx);
    const current_location = await asn.cityLookupHtml(current_ip);
    const current_asn = asn.asnLookupStr(current_ip);

  ctx.body = await ctx.render('index.hbs', {
    current_asn,
    current_ip,
    current_location,
    h1: 'Resolve.rs',
    title: 'Resolve.rs',
  });
});

rootRouter.get('/api.html', async (ctx:any) => {
    ctx.body = await ctx.render('api.hbs', {
        title: 'API',
     });
});

rootRouter.get('/contact.html', async (ctx:any) => {
    ctx.body = await ctx.render('contact.hbs', {
        title: 'Contact',
     });
});

rootRouter.get('/index.html', async (ctx) => {
    await ctx.redirect('/');
});

rootRouter.get('/sitemap.xml', sitemap);

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
          util.handleJsonp(ctx, retVal);
      } else {
          ctx.set('Access-Control-Allow-Origin', '*');
          ctx.set('Access-Control-Allow-Methods', 'POST, GET');
          ctx.set('Access-Control-Max-Age', '604800');
          ctx.body = retVal;
      }
});

rootRouter.get('/tools.html', async (ctx:any) => {
    ctx.body = await ctx.render('tools.hbs', {
        current_ip: getCurrentIP(ctx),
        title: 'Tools',
     });
});

/*
 * I've moved things out of the root: don't break the old links
 */
rootRouter.get('/iplocation.html', async (ctx:any) => {
    await ctx.redirect('/ip/geolocation.html');
});

rootRouter.get('/reverse-dns-lookup.html', async (ctx:any) => {
    await ctx.redirect('/dns/reverse-lookup.html');
});

rootRouter.get('/lookup.html', async (ctx) => {
    await ctx.redirect('/dns/lookup.html');
});

rootRouter.get('/dns-lookup.html', async (ctx) => {
    await ctx.redirect('/dns/lookup.html');
});

rootRouter.get('/headers.html', async (ctx:any) => {
    ctx.redirect('/http/headers.html');
});

export {
    rootRouter
}
