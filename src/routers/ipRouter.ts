import Router from 'koa-router';
//import * as punycode from 'punycode';
//import * as domains from '../data/domainData';
//import * as util from '../util';
import * as asn from '../data/maxmindData';
//import { URL } from 'url';

import * as util from '../util';

const ipRouter = new Router();

ipRouter.get('/ip/', async (ctx) => {
    ctx.redirect('/ip/index.html');
});

ipRouter.get('/ip/index.html', async (ctx) => {
    ctx.redirect('/tools.html#ip');
});

function getCurrentIP(ctx:any):string {
    return ctx.ips.length > 0 ? ctx.ips[0] : ctx.ip;
}

ipRouter.get('/ip/geolocation.html', async (ctx:any) => {

    let ip = ctx.request.query['ip'] || ctx.request.body.ip;
    const current_ip = getCurrentIP(ctx);
    if (!ip) {
      ip = current_ip;
    }
    const maxmind = await asn.cityLookupHtml(ip);

  ctx.body = await ctx.render('ip/geolocation.hbs', {
    current_ip,
    maxmind,
    ip,
    title: 'IP Address Geolocation',
  });
});

ipRouter.get('/ip/whatsmyip.html', async (ctx:any) => {
    ctx.body = await ctx.render('ip/whatsmyip.hbs', {
        current_ip: getCurrentIP(ctx),
        title: `What's my IP address?`,
     });
});

ipRouter.get('/ip/whatsmyip.json', async (ctx) => {
    util.handleJsonp(ctx, {
        success: true,
        ip: getCurrentIP(ctx)
    });
});

ipRouter.get('/ip/whatsmyip.txt', async (ctx) => {
    ctx.body = getCurrentIP(ctx);
});

function getUrls():string[] {
    return [
        "/ip/geolocation.html",
        "/ip/whatsmyip.html",
    ];
}

export {
    getCurrentIP,
    getUrls,
    ipRouter
}
