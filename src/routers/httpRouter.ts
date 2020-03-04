import Router from 'koa-router';
//import * as punycode from 'punycode';
//import * as domains from '../data/domainData';
//import * as util from '../util';
import { URL } from 'url';

const httpRouter = new Router();

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

export {
    httpRouter
}
