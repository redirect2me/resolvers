import { promises as fsPromises } from 'fs';
import Router from 'koa-router';
import * as path from 'path';
//import * as punycode from 'punycode';
import * as asnlookup from '../actions/asnlookup';
//import * as domains from '../data/domainData';
import * as maxmind from '../data/maxmindData';
import { getCurrentIP } from '../util';
//import { URL } from 'url';

import * as certcheck from '../actions/certcheck';
import config from '../config';
import * as util from '../util';

const ipRouter = new Router();

ipRouter.get('/ip/', async (ctx) => {
    ctx.redirect('/ip/index.html');
});

ipRouter.get('/ip/index.html', async (ctx) => {
    ctx.redirect('/tools.html#ip');
});


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
        ip,
        ipgeolocation_api_key: config.get('ipGeoLocationApiKey'),
        maxmind: location,
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

ipRouter.get('/ip/asn-lookup.html', asnlookup.asnLookupGet);
ipRouter.get('/ip/asn-lookup.json', asnlookup.asnLookupAPIGet);
ipRouter.post('/ip/asn-lookup.json', asnlookup.asnLookupAPIPost);
ipRouter.get('/ip/tls-cert-check.html', certcheck.tlsCertCheckGet);
ipRouter.post('/ip/tls-cert-check.html', certcheck.tlsCertCheckPost);

function getUrls():string[] {
    return [
        "/ip/asn-lookup.html",
        "/ip/geolocation.html",
        "/ip/tcp-ports.html",
        "/ip/tls-cert-check.html",
        "/ip/whatsmyip.html",
    ];
}

export {
    getCurrentIP,
    getUrls,
    ipRouter
}
