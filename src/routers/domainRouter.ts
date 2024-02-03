import KoaRouter from 'koa-router';
import * as punycode from 'punycode';
import * as wsw from 'whoisserver-world'

import * as domainData from '../data/domainData';
import * as domainFinder from '../actions/domainfinder';
import * as expirationCheck from '../actions/expirationCheck';
import * as rdapProxyConf from '../actions/rdapProxyConf';
import * as rdapData from '../data/rdapData';
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
        domain: domain.trim(),
        title: 'Domain Health Check',
        titleimg: '/images/scales.svg',
      });
}

domainRouter.get('/domains/icann-vs-psl.html', async (ctx:any) => {

    const icannOnly = new Set<string>();
    domainData.icannTlds.forEach( domain => icannOnly.add(domain));
    Object.keys(domainData.pslTlds).forEach( domain => icannOnly.delete(domain));

    const pslOnly = new Set<string>();
    Object.keys(domainData.pslTlds).forEach( domain => pslOnly.add(domain));
    domainData.icannTlds.forEach( domain => pslOnly.delete(domain));

    ctx.body = await ctx.render('domains/icann-vs-psl.hbs', {
        domains: domainData.usableTlds,
        icannOnly: [...icannOnly],
        pslOnly: [...pslOnly],
        title: 'Domains in ICANN vs PublicSuffixList',
     });
});

domainRouter.get('/domains/icann-vs-wsw.html', async (ctx:any) => {

    const icannOnly = new Set<string>();
    domainData.icannTlds.forEach( domain => icannOnly.add(domain));
    Object.getOwnPropertyNames(wsw.tlds()).forEach( domain => icannOnly.delete(punycode.toUnicode(domain)));

    const wswOnly = new Set<string>();
    Object.getOwnPropertyNames(wsw.tlds()).forEach( domain => wswOnly.add(punycode.toUnicode(domain)));
    domainData.icannTlds.forEach( domain => wswOnly.delete(domain));

    ctx.body = await ctx.render('domains/icann-vs-wsw.hbs', {
        domains: domainData.usableTlds,
        icannOnly: [...icannOnly],
        wswOnly: [...wswOnly],
        title: 'Domains in ICANN vs whoisserver-world',
     });
});

domainRouter.get('/domains/publicsuffix.html', async (ctx: any) => {
    ctx.redirect(ctx, '/psl/test.html');
});

domainRouter.post('/domains/publicsuffix.html', async (ctx: any) => {
    ctx.redirect(ctx, `/psl/test.html?q=${encodeURIComponent(ctx.request.body.hostname)}`);
});

domainRouter.get('/domains/psl-tlds.html', async (ctx:any) => {
    ctx.redirect(ctx, '/psl/index.html');
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

domainRouter.get('/domains/rdap.html', async (ctx:any) => {
    const theList = rdapData.list().filter(ri => ri.rdap);

    theList.sort((a, b) => (a.unicode.localeCompare(b.unicode)));

    ctx.body = await ctx.render('domains/rdap.hbs', {
        list: theList,
        title: 'RDAP Servers',
     });
});

domainRouter.get('/domains/rdap-missing.html', async (ctx:any) => {
    const theList = rdapData.list().filter(ri => ri.rdap);

    const ianaSet = new Set<String>();
    theList.forEach((ri) => { if (ri.official) { ianaSet.add(ri.unicode) }});

    const missing:any[] = [];

    domainData.icannTlds.forEach((tld) => {
        if (!ianaSet.has(tld)) {
            const rdapInfo = rdapData.get(tld);
            missing.push({
                unicode: tld,
                rdap: rdapInfo?.rdap,
                unofficial: rdapInfo?.official == false && rdapInfo?.working == true,
                found: rdapInfo?.official == false && !rdapInfo?.working
            });
        }
    });

    const foundBad = theList.filter(ri => ri.official == false && !ri.working);
    const foundWorking = theList.filter(ri => ri.official == false && ri.working);

    ctx.body = await ctx.render('domains/rdap-missing.hbs', {
        foundBad,
        foundWorking,
        iana: Array.from(ianaSet).sort(),
        missing,
        title: 'Missing and Unofficial RDAP Servers',
     });
});

domainRouter.get('/domains/rdap.json', async (ctx:any) => {

    const lookup: { [key:string]:string } = {};

    rdapData.list().filter(ri => ri.official || ri.working).forEach(ri => { if (ri.rdap) { lookup[ri.tld] = ri.rdap; }});

    util.handleJsonp(ctx, { success: true, lookup });
});

domainRouter.get('/domains/finder.html', domainFinder.domainFinderGet);
domainRouter.post('/domains/finder.html', domainFinder.domainFinderPost);
domainRouter.get('/domains/expiration-check.json', expirationCheck.expirationCheckApiGet);
domainRouter.post('/domains/expiration-check.json', expirationCheck.expirationCheckApiPost);
domainRouter.get('/domains/expiration-check.html', expirationCheck.expirationCheckGet);
domainRouter.post('/domains/expiration-check.html', expirationCheck.expirationCheckPost);
domainRouter.get('/domains/rdap-proxy.yaml', rdapProxyConf.rdapProxyConfGet );

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
        "/domains/rdap.html",
        "/domains/tlds.html",
        "/domains/usable-tlds.html",
    ];
}

export {
    domainRouter,
    getUrls
}
