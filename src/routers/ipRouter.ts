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
import { bigdatacloudLookup } from '../actions/bigdatacloudlookup';
import { keycdnLookup } from '../actions/keycdnlookup';
import { ipstackLookup } from '../actions/ipstacklookup';
import { ipdataLookup } from '../actions/ipdatalookup';
import { ip_apiLookup } from '../actions/ip_apilookup';
import { ipapiLookup } from '../actions/ipapilookup';
import { ipinfoLookup } from '../actions/ipinfolookup';
import { ipinsightLookup } from '../actions/ipinsightlookup';
import { abstractapiLookup } from '../actions/abstractapilookup';
import { ip2locationLookup } from '../actions/ip2locationlookup';
import { ipregistryLookup } from '../actions/ipregistrylookup';
import { labstackLookup } from '../actions/labstacklookup';
import { radarioLookup } from '../actions/radariolookup';
import { astroipLookup } from '../actions/astroiplookup';

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
    } else {
        ip = ip.trim();
    }

    ctx.body = await ctx.render('ip/geolocation.hbs', {
        asn: maxmind.asnLookupStr(ip),
        ip,
        ipgeolocation_api_key: config.get('ipGeoLocationApiKey'),
        is_current_ip: ip == current_ip,
        maxmind_noscript: maxmind.cityLookupHtml(ip),
        maxmind: maxmind.cityLookup(ip),
        title: 'IP Address Geolocation',
    });
});

ipRouter.get('/ip/speedtest.html', async (ctx: any) => {
    ctx.body = await ctx.render('ip/speedtest.hbs', {
        title: 'Speed Test',
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
ipRouter.get('/internal/abstractapi.json', abstractapiLookup);
ipRouter.get('/internal/astroip.json', astroipLookup);
ipRouter.get('/internal/bigdatacloud.json', bigdatacloudLookup);
ipRouter.get('/internal/ip-api.json', ip_apiLookup);
ipRouter.get('/internal/ip2location.json', ip2locationLookup);
ipRouter.get('/internal/ipapi.json', ipapiLookup);
ipRouter.get('/internal/ipdata.json', ipdataLookup);
ipRouter.get('/internal/ipinfo.json', ipinfoLookup);
ipRouter.get('/internal/ipinsight.json', ipinsightLookup);
ipRouter.get('/internal/ipstack.json', ipstackLookup);
ipRouter.get('/internal/ipregistry.json', ipregistryLookup);
ipRouter.get('/internal/keycdn.json', keycdnLookup);
ipRouter.get('/internal/labstack.json', labstackLookup);
ipRouter.get('/internal/radario.json', radarioLookup);

function getUrls():string[] {
    return [
        "/ip/asn-lookup.html",
        "/ip/geolocation.html",
        "/ip/speedtest.html",
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
