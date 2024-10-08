import { promises as fsPromises } from 'fs';
import Koa from 'koa';
import Router from '@koa/router';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

import * as certcheck from "../actions/certcheck.js";
import * as floccheck from "../actions/floccheck.js";
import * as headers from "../actions/headers.js";
import * as redirectcheck from "../actions/redirectcheck.js";
import * as util from "../util.js";

const httpRouter = new Router();

httpRouter.get('/http/content-type.html', async (ctx: any) => {
    const portsFile = path.join(__dirname, '../..', 'data', 'mimetype.yaml');
    const mimeTypes = yaml.load(await fsPromises.readFile(portsFile, 'utf-8'));
    ctx.body = await ctx.render('http/content-type.hbs', {
        mimeTypes,
        title: 'MIME Content-Type Values',
    });
});

httpRouter.all('/http/echo.json', async (ctx:Koa.ExtendableContext) => {
    util.handleJsonp(ctx, {
        headers: ctx.request.headers,
        href: ctx.request.href,
        method: ctx.request.method,
    });
});

httpRouter.get('/http/urlencode.html', async (ctx:any) => {
    ctx.body = await ctx.render('http/urlencode.hbs', {
        h1: 'URLEncode/URLDecode a String',
        title: 'URLEncode/URLDecode',
     });
});

httpRouter.get('/http/urlparse.html', async (ctx:any) => {
    const theUrl = ctx.query.url || ctx.request.href;

    ctx.body = await ctx.render('http/urlparse.hbs', {
        url: theUrl,
        parsed: url.parse(theUrl),
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

httpRouter.get('/http/myheaders.html', async (ctx:any) => {
    ctx.body = await ctx.render('http/myheaders.hbs', {
        headers: ctx.request.headers,
        title: 'HTTP Request Headers',
     });
});

httpRouter.all('/http/myheaders.json', async (ctx) => {
    util.handleJsonp(ctx, {
        ip: util.getCurrentIP(ctx),
        headers: ctx.request.headers,
        method: ctx.request.method,
    });
});

httpRouter.get('/http/bulk-cert-check.html', certcheck.httpsBulkCertCheckGet);
httpRouter.post('/http/bulk-cert-check.html', certcheck.httpsBulkCertCheckPost);
httpRouter.get('/http/cert-check.json', certcheck.httpsCertCheckApi);
httpRouter.get('/http/cert-check.html', certcheck.httpsCertCheckGet);
httpRouter.post('/http/cert-check.html', certcheck.httpsCertCheckPost);

httpRouter.get('/http/floc-check.html', floccheck.flocCheckGet);
httpRouter.post('/http/floc-check.html', floccheck.flocCheckPost);
httpRouter.get('/http/floc-check.json', floccheck.flocCheckApiGet);
httpRouter.post('/http/floc-check.json', floccheck.flocCheckApiPost);

httpRouter.get('/http/redirect-check.html', redirectcheck.redirectCheckGet);
httpRouter.post('/http/redirect-check.html', redirectcheck.redirectCheckPost);
httpRouter.get('/http/redirect-check.json', redirectcheck.redirectCheckApiGet);
httpRouter.post('/http/redirect-check.json', redirectcheck.redirectCheckApiPost);

httpRouter.get('/http/headers.html', headers.headersGet);
httpRouter.get('/http/headers.json', headers.headersApiGet);
httpRouter.post('/http/headers.json', headers.headersApiPost);

function getUrls():string[] {
    return [
        "/http/cert-check.html",
        "/http/content-type.html",
        "/http/floc-check.html",
        "/http/headers.html",
        "/http/myheaders.html",
        "/http/redirect-check.html",
        "/http/urlencode.html",
        "/http/urlparse.html",
        "/http/useragent.html",
    ];
}

export {
    httpRouter,
    getUrls
}
