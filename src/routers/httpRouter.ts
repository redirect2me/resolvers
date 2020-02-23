import Router from 'koa-router';
//import * as punycode from 'punycode';
import * as domains from '../domains';
//import * as util from '../util';

const httpRouter = new Router();

httpRouter.get('/domains/tlds.html', async (ctx:any) => {
    ctx.body = await ctx.render('domains/tlds.hbs', {
        domains: domains.allTlds,
        title: 'Top Level Domains',
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
