import Router from 'koa-router';
import * as punycode from 'punycode';
import * as domains from '../domains';
import * as util from '../util';

const domainRouter = new Router();

domainRouter.get('/domains/tlds.html', async (ctx:any) => {
    ctx.body = await ctx.render('domains/tlds.hbs', {
        domains: domains.allTlds,
        title: 'Top Level Domains',
     });
});

domainRouter.get('/domains/', async (ctx) => {
    ctx.redirect('/domains/index.html');
});

domainRouter.get('/domains/index.html', async (ctx) => {
    ctx.redirect('/tools.html#domains');
});

domainRouter.get('/domains/tlds.txt', async (ctx) => {
    ctx.body = domains.allTlds.join('\n');
});

domainRouter.get('/domains/tlds.json', async (ctx) => {

    if (!util.validateCaller(ctx)) {
        return;
    }

    util.handleJsonp(ctx, { success: true, count: domains.allTlds.length, domains: domains.allTlds });
});

domainRouter.get('/domains/usable-tlds.html', async (ctx:any) => {
    ctx.body = await ctx.render('domains/usable-tlds.hbs', {
        domains: domains.usableTlds,
        title: 'Usable Top Level Domains',
     });
});

domainRouter.get('/domains/nice-tlds.html', async (ctx:any) => {
    ctx.body = await ctx.render('domains/nice-tlds.hbs', {
        domains: domains.niceTlds,
        title: 'Nice Top Level Domains',
     });
});


domainRouter.get('/domains/punycode.html', async (ctx:any) => {

    const domain = ctx.request.query['domain'];
    let conversion = '';
    let result = '';

    if (domain) {
        if (domain.match(/^[-a-z0-9.]+$/i)) {
            conversion = 'toUnicode';
            result = punycode.toUnicode(domain);
        }
        else {
            conversion = 'toASCII';
            result = punycode.toASCII(domain);
        }
    }

    ctx.body = await ctx.render('domains/punycode.hbs', {
        conversion,
        domain,
        h1: 'Punycode Converter',
        result,
        title: 'Online Punycode Converter',
     });
});

export {
    domainRouter
}
