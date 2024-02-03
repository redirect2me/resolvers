import Handlebars from 'handlebars';
import KoaRouter from 'koa-router';
import path from 'path';
import * as psl from 'psl';

import { ChangeLog } from '../changelog';
import { ChangeLogUI } from '../ChangeLogUI';
import * as domainData from '../data/domainData';

const pslRouter = new KoaRouter();

pslRouter.get('/psl/', async (ctx: any) => {
    ctx.redirect(ctx, '/psl/index.html');
});


pslRouter.get('/psl/index.html', async (ctx: any) => {
    
    ctx.body = await ctx.render('psl/index.hbs', {
        domains: Object.keys(domainData.pslTlds).sort((a, b) => { return a.localeCompare(b); }),
        psl: domainData.pslTlds,
        title: 'Public Suffix List Top Level Domains',
        total: Object.values(domainData.pslTlds).reduce((acc, val) => acc + val.length, 0),
    });
});

pslRouter.get('/psl/test.html', async (ctx: any) => {

    const q = ctx.request.query.q;
    const hostname = q;
    let get: string | null | undefined;
    let parsed: psl.ParsedDomain | psl.ParseError | null | undefined;
    if (hostname) {
        if (!psl.isValid(hostname)) {
            ctx.flash('error', `${Handlebars.escapeExpression(hostname)} is not a valid public domain!`);
        } else {
            get = psl.get(hostname);
            parsed = psl.parse(hostname);

            if (parsed.error) {
                ctx.flash('error', `${parsed.error.message} for ${Handlebars.escapeExpression(hostname)}`);
                parsed = null;
            }
        }
    }

    ctx.body = await ctx.render('psl/test.hbs', {
        examples: ['test.github.io', 'github.io'],
        get,
        parsed,
        q,
        title: 'Public Suffix Test',
    });
});

const pslChangeLogUI:ChangeLogUI = new ChangeLogUI(
    new ChangeLog(path.join(__dirname, '../../data/publicsuffix/deltas')),
    '/psl/index.html',
    '/psl/changelog',
    'Public Suffix List',
    'https://botsin.space/@PublicSuffixChanges',
);
const pslChangeLogRouter = pslChangeLogUI.changelogRouter;
const pslChangeLogGetUrls = pslChangeLogUI.getUrls;

export {
    pslRouter,
    pslChangeLogRouter,
    pslChangeLogGetUrls,
}
