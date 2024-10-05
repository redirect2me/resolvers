import Handlebars from 'handlebars';
import Router from '@koa/router';
import path from 'path';
import * as tldts from 'tldts';
import * as url from "url";

import { ChangeLog } from "../changelog.js";
import { ChangeLogUI } from "../ChangeLogUI.js";
import * as domainData from "../data/domainData.js";
import * as util from "../util.js";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const pslRouter = new Router();

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
    let parsed: any;
    if (hostname) {
        if (!util.hasValidPublicSuffix(hostname)) {
            ctx.flash('error', `${Handlebars.escapeExpression(hostname)} is not a valid public domain!`);
        } else {
            parsed = tldts.parse(hostname);
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
    '/psl/changelog/index.html',
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
