import Router from 'koa-router';
import * as domains from '../domains';
import * as util from '../util';

const domainRouter = new Router();

domainRouter.get('/top-level-domains.html', async (ctx) => {
    ctx.redirect('/top-level-domains.txt');
});

domainRouter.get('/top-level-domains.txt', async (ctx) => {
    ctx.body = domains.allTlds.join('\n');
});

domainRouter.get('/top-level-domains.json', async (ctx) => {

    if (!util.validateCaller(ctx)) {
        return;
    }

    util.handleJsonp(ctx, { success: true, count: domains.allTlds.length, domains: domains.allTlds });
});

export {
    domainRouter
}
