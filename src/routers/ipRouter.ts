import { promises as fsPromises } from 'fs';
import Router from 'koa-router';
import * as path from 'path';
//import * as punycode from 'punycode';
//import * as domains from '../data/domainData';
import * as maxmind from '../data/maxmindData';
//import * as util from '../util';
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
    const location = maxmind.cityLookupHtml(ip);
    const asn = maxmind.asnLookupStr(ip);

  ctx.body = await ctx.render('ip/geolocation.hbs', {
    asn,
    current_ip,
    maxmind: location,
    ip,
    title: 'IP Address Geolocation',
  });
});

ipRouter.get('/ip/tcp-ports.html', async (ctx: any) => {
    const portsFile = path.join(__dirname, '../..', 'data', 'tcp-ports.json');
    const ports = JSON.parse(await fsPromises.readFile(portsFile, 'utf-8'));
    ctx.body = await ctx.render('ip/tcp-ports.hbs', {
        ports,
        title: 'Common TCP Ports',
    });
});

ipRouter.get('/ip/whatsmyip.html', async (ctx:any) => {
    const current_ip = getCurrentIP(ctx);
    const asn = maxmind.asnLookupStr(current_ip);
    const location = maxmind.cityLookupHtml(current_ip);
    ctx.body = await ctx.render('ip/whatsmyip.hbs', {
        asn,
        current_ip,
        location,
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
        "/ip/tcp-ports.html",
        "/ip/whatsmyip.html",
    ];
}

export {
    getCurrentIP,
    getUrls,
    ipRouter
}
