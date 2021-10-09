import KoaRouter from 'koa-router';
import Handlebars from 'handlebars';
import * as punycode from 'punycode';
import * as psl from 'psl';

import * as domainData from '../data/domainData';
import * as domainFinder from '../actions/domainfinder';
import * as expirationCheck from '../actions/expirationCheck';
import * as util from '../util';

const domainRouter = new KoaRouter();

domainRouter.get('/domains/tlds.html', async (ctx:any) => {

    ctx.body = await ctx.render('domains/tlds.hbs', {
        domains: domainData.icannTlds,
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
    const ifPunycode = util.getBoolean(ctx.request.query["punycode"], false);

    const domains = ifPunycode ? domainData.icannTlds.map(x => punycode.toASCII(x)) : domainData.icannTlds;

    ctx.body = domains.join('\n');
});

domainRouter.get('/domains/tlds.json', async (ctx) => {

    if (!util.validateCaller(ctx)) {
        return;
    }

    const ifPunycode = util.getBoolean(ctx.request.query["punycode"], false);

    const domains = ifPunycode ? domainData.icannTlds.map(x => punycode.toASCII(x)) : domainData.icannTlds;

    util.handleJsonp(ctx, { success: true, count: domainData.icannTlds.length, domains });
});

domainRouter.get('/domains/health-check.html', async (ctx:any) => {
    await healthCheckLow(ctx, util.getFirst(ctx.query.domain) || '');
});

domainRouter.post('/domains/health-check.html',  async (ctx:any) => {
    await healthCheckLow(ctx, ctx.request.body.domain || '');
});

async function healthCheckLow(ctx:any, domain:string) {
    ctx.body = await ctx.render('domains/health-check.hbs', {
        domain,
        title: 'Domain Health Check'
      });
}

domainRouter.get('/domains/icann-vs-psl.html', async (ctx:any) => {

    const icannOnly = new Set<string>();
    domainData.icannTlds.forEach( domain => icannOnly.add(domain));
    domainData.pslTlds.forEach( domain => icannOnly.delete(domain));

    const pslOnly = new Set<string>();
    domainData.pslTlds.forEach( domain => pslOnly.add(domain));
    domainData.icannTlds.forEach( domain => pslOnly.delete(domain));

    ctx.body = await ctx.render('domains/icann-vs-psl.hbs', {
        domains: domainData.usableTlds,
        icannOnly: [...icannOnly],
        pslOnly: [...pslOnly],
        title: 'Domains in ICANN vs PublicSuffixList',
     });
});

domainRouter.get('/domains/psl-tlds.html', async (ctx:any) => {
    ctx.body = await ctx.render('domains/psl-tlds.hbs', {
        domains: domainData.pslTlds,
        title: 'PublicSuffixList Top Level Domains',
     });
});

domainRouter.get('/domains/publicsuffix.html', async (ctx:any) => {
    ctx.body = await ctx.render('domains/publicsuffix.hbs', {
        hostname: ctx.request.query.hostname,
        title: 'Public suffix for a hostname',
     });
});

domainRouter.post('/domains/publicsuffix.html', async (ctx:any) => {

    const hostname = ctx.request.body.hostname;
    if (!hostname) {
      ctx.flash('error', 'You must enter a hostname to check!');
      ctx.redirect('publicsuffix.html');
      return;
    }

    if (!psl.isValid(hostname)) {
      ctx.flash('error', `${Handlebars.escapeExpression(hostname)} is not a valid hostname!`);
      ctx.redirect(`publicsuffix.html?hostname=${encodeURIComponent(hostname)}`);
      return;
    }

    ctx.body = await ctx.render('domains/publicsuffix.hbs', {
        hostname: ctx.request.body.hostname,
        get: psl.get(hostname),
        parsed: psl.parse(hostname),
        title: 'Public suffix for a hostname',
     });
});

domainRouter.get('/domains/usable-tlds.html', async (ctx:any) => {
    ctx.body = await ctx.render('domains/usable-tlds.hbs', {
        domains: domainData.usableTlds,
        title: 'Usable Top Level Domains',
     });
});

domainRouter.get('/domains/nice-tlds.html', async (ctx:any) => {
    ctx.body = await ctx.render('domains/nice-tlds.hbs', {
        domains: domainData.niceTlds,
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

domainRouter.get('/domains/finder.html', domainFinder.domainFinderGet);
domainRouter.post('/domains/finder.html', domainFinder.domainFinderPost);
domainRouter.get('/domains/expiration-check.json', expirationCheck.expirationCheckApiGet);
domainRouter.post('/domains/expiration-check.json', expirationCheck.expirationCheckApiPost);
domainRouter.get('/domains/expiration-check.html', expirationCheck.expirationCheckGet);
domainRouter.post('/domains/expiration-check.html', expirationCheck.expirationCheckPost);

function getUrls():string[] {
    return [
        "/domains/expiration-check.html",
        "/domains/finder.html",
        "/domains/health-check.html",
        "/domains/icann-vs-psl.html",
        "/domains/nice-tlds.html",
        "/domains/psl-tlds.html",
        "/domains/publicsuffix.html",
        "/domains/punycode.html",
        "/domains/tlds.html",
        "/domains/usable-tlds.html",
    ];
}

export {
    domainRouter,
    getUrls
}
