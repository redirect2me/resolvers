import Router from 'koa-router';
//import * as punycode from 'punycode';
import * as asn from '../data/maxmindData';
//import * as domains from '../data/domainData';
import * as os from 'os';
import * as resolvers from '../data/resolverData';
import * as util from '../util';

const rootRouter = new Router();

rootRouter.get('/', async (ctx:any) => {
    const current_ip = ctx.ips.length > 0 ? ctx.ips[0] : ctx.ip;
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

rootRouter.get('/headers.html', async (ctx:any) => {
    ctx.redirect('/http/headers.html');
});

rootRouter.get('/index.html', async (ctx) => {
    await ctx.redirect('/');
});

rootRouter.get('/iplocation.html', async (ctx:any) => {

    let ip = ctx.request.query['ip'] || ctx.request.body.ip;
    const current_ip = ctx.ips.length > 0 ? ctx.ips[0] : ctx.ip;
    if (!ip) {
      ip = current_ip;
    }
    const maxmind = await asn.cityLookupHtml(ip);

  ctx.body = await ctx.render('iplocation.hbs', {
    current_ip,
    maxmind,
    ip,
    title: 'IP Address Geolocation',
  });
});
rootRouter.get('/sitemap.xml', async (ctx:any) => {

    const urls:string[] = [];

    urls.push("/");
    urls.push("/dns-lookup.html");
    urls.push("/domains/nice-tlds.html");
    urls.push("/domains/punycode.html");
    urls.push("/domains/tlds.html");
    urls.push("/domains/usable-tlds.html");
    urls.push("/http/headers.html");
    urls.push("/iplocation.html");
    urls.push("/resolvers/index.html");
    for (const resolver of resolvers.getAll()) {
      urls.push(`/resolvers/${resolver.key}/index.html`);
    }
    urls.push("/reverse-dns-lookup.html");

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
        title: 'Tools',
     });
});


export {
    rootRouter
}
