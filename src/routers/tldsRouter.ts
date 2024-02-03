import * as punycode from 'punycode';
import Router from 'koa-router';
import path from 'path';
import * as wsw from 'whoisserver-world'

import * as rdapData from '../data/rdapData';
import { ChangeLog } from '../changelog';
import { ChangeLogUI } from '../ChangeLogUI';
import * as domainData from '../data/domainData';

const tldsRouter = new Router();

tldsRouter.get('/tlds/index.html', async (ctx: any) => {

    const tldMap = wsw.tlds();
    const unsortedTlds:any[] = [];
    Object.getOwnPropertyNames(tldMap).forEach(x => unsortedTlds.push(tldMap[x]));
    unsortedTlds.forEach(x => { x.unicode = punycode.toUnicode(x.tld) })
    const tlds = unsortedTlds.sort((a, b) => { return a.unicode.localeCompare(b.unicode) });
    ctx.body = await ctx.render('tlds/index.hbs', {
        tlds,
        title: 'Top Level Domains',
    });

});

tldsRouter.get('/tlds/', async (ctx) => {
    ctx.redirect('/tlds/index.html');
});

// this must come after base /tlds/ routes
tldsRouter.get('/tlds/:tld', async (ctx) => {
    ctx.redirect(`${encodeURIComponent(ctx.params.tld)}/index.html`);
});

tldsRouter.get('/tlds/:tld/', async (ctx) => {
    ctx.redirect('index.html');
});

tldsRouter.get('/tlds/:tld/index.html', async (ctx:any) => {

    const tld = ctx.params.tld;

    if (tld.startsWith("xn--")) {
        ctx.redirect(`/tlds/${encodeURIComponent(punycode.toUnicode(tld))}/index.html`);
        return;
    }

    const lower = tld.toLowerCase();
    if (tld !== lower) {
        ctx.redirect(`/tlds/${encodeURIComponent(lower)}/index.html`);
        return;
    }

    const tldInfo = wsw.tldDetails(punycode.toASCII(tld));
    if (!tldInfo) {
      ctx.flash('error', `Sorry, we don't have any info for the domain "${tld}".`)
      ctx.redirect("/tlds/index.html");
      return;
    }

    let rdapUnofficial:string|undefined;
    if (!tldInfo.rdap) {
        const rdapInfo = rdapData.get(tld);
        if (rdapInfo && !rdapInfo.official && rdapInfo.working) {
            rdapUnofficial = rdapInfo.rdap;
        }
    }

    const sampleDomains:string[] = [];

    Object.getOwnPropertyNames(tldInfo.sampleDomains).forEach(propName => {
        sampleDomains.push(...tldInfo.sampleDomains[propName]);
    });

    tldInfo.unicode = punycode.toUnicode(tld);

    ctx.body = await ctx.render('_tlds/index.hbs', {
        publicSuffixes: domainData.pslTlds[tld],
        rdapUnofficial,
        sampleDomains,
        title: `Top Level Domain "${tld}"`,
        tld: tldInfo,
    });
});

function getUrls():string[] {
    const retVal = [
        "/tlds/index.html",
    ];

    Object.getOwnPropertyNames(wsw.tlds()).forEach((tldRaw) => {
        const tld = punycode.toUnicode(tldRaw);
        retVal.push(`/tlds/${tld}/index.html`);
    });

    return retVal;
}

const tldChangeLogUI: ChangeLogUI = new ChangeLogUI(
    new ChangeLog(path.join(__dirname, '../../data/icann/deltas')),
    '/tlds/index.html',
    '/tlds/changelog',
    'ICANN TLD',
    'https://botsin.space/@TLDChanges',
);
const tldsChangeLogRouter = tldChangeLogUI.changelogRouter;
const tldsChangeLogGetUrls = tldChangeLogUI.getUrls;

export {
    tldsRouter,
    getUrls,
    tldsChangeLogRouter,
    tldsChangeLogGetUrls,
}
