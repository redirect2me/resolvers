import { promises as fsPromises } from 'fs';
import Router from 'koa-router';
import * as path from 'path';
import * as yaml from 'js-yaml';
//import * as punycode from 'punycode';
//import * as domains from '../data/domainData';
//import * as util from '../util';
import { URL } from 'url';

import * as certcheck from '../actions/certcheck';

const httpRouter = new Router();

httpRouter.get('/http/content-type.html', async (ctx: any) => {
    const portsFile = path.join(__dirname, '../..', 'data', 'mimetype.yaml');
    const mimeTypes = yaml.safeLoad(await fsPromises.readFile(portsFile, 'utf-8'));
    ctx.body = await ctx.render('http/content-type.hbs', {
        mimeTypes,
        title: 'MIME Content-Type Values',
    });
});

httpRouter.get('/http/urlencode.html', async (ctx:any) => {
    ctx.body = await ctx.render('http/urlencode.hbs', {
        h1: 'URLEncode/URLDecode a String',
        title: 'URLEncode/URLDecode',
     });
});

httpRouter.get('/http/urlparse.html', async (ctx:any) => {
    const url = ctx.query.url || ctx.request.href;

    ctx.body = await ctx.render('http/urlparse.hbs', {
        url,
        parsed: new URL(url),
        title: 'Parse a URL',
     });
});

httpRouter.get('/http/useragent.html', async (ctx:any) => {
    ctx.body = await ctx.render('http/useragent.hbs', {
        h1: 'Your User Agent',
        title: 'User Agent',
        userAgent: ctx.request.headers['user-agent'],
     });
});

httpRouter.get('/http/', async (ctx) => {
    ctx.redirect('/http/index.html');
});

httpRouter.get('/http/index.html', async (ctx) => {
    ctx.redirect('/tools.html#http');
});

httpRouter.get('/http/headers.html', async (ctx:any) => {
    ctx.body = await ctx.render('http/headers.hbs', {
        headers: ctx.request.headers,
        title: 'HTTP Headers',
     });
});

httpRouter.get('/http/headers.json', async (ctx) => {
    ctx.body = ctx.request.headers;
  });

httpRouter.get('/http/cert-check.html', certcheck.certCheckGet);
httpRouter.post('/http/cert-check.html', certcheck.certCheckPost);

function getUrls():string[] {
    return [
        "/http/cert-check.html",
        "/http/content-type.html",
        "/http/headers.html",
        "/http/urlencode.html",
        "/http/urlparse.html",
        "/http/useragent.html",
    ];
}

export {
    httpRouter,
    getUrls
}
