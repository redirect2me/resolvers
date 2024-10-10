//import { promises as fsPromises } from 'fs';
import HaikunatorImpl from "haikunator";
const Haikunator = HaikunatorImpl as unknown as typeof HaikunatorImpl.default;
import Koa from 'koa';
import Router from '@koa/router';

import * as util from "../util.js";

const datagenRouter = new Router();

const DEFAULT_TOKEN_LENGTH = 2;
const DEFAULT_TOKEN_CHARS = '23456789';
const DEFAULT_SEPARATOR = '-'
function generateNames(ctx: any): string[] {

    var haikunator = new Haikunator({
        defaults: {
            delimiter: (typeof ctx.request.query.delimiter != "undefined") ? ctx.request.query.delimiter : DEFAULT_SEPARATOR,
            tokenLength: util.safeParseInt(ctx.request.query.tokenLength, DEFAULT_TOKEN_LENGTH),
            tokenChars: ctx.request.query.tokenChars || DEFAULT_TOKEN_CHARS,
        }
    });

    let names:string[] = [];

    let count = util.safeParseInt(ctx.request.query.count, 1);
    if (count < 1) {
        count = 1;
    } else if (count > 256) {
        count = 256;
    }

    for (var loop = 0; loop < count; loop++) {
        names.push(haikunator.haikunate());
    }

    return names;
}

datagenRouter.get('/datagen/haikunator.html', async (ctx: any) => {

    ctx.body = await ctx.render('datagen/haikunator.hbs', {
        count: util.safeParseInt(ctx.request.query.count, 1),
        delimiter: (typeof ctx.request.query.delimiter != "undefined") ? ctx.request.query.delimiter : DEFAULT_SEPARATOR,
        names: generateNames(ctx),
        title: 'Heroku-style Name Generator',
        tokenChars: ctx.request.query.tokenChars || DEFAULT_TOKEN_CHARS,
        tokenLength: ctx.request.query.tokenLength || DEFAULT_TOKEN_LENGTH,
    });

});

datagenRouter.get('/datagen/haikunator.json', async (ctx:Koa.ExtendableContext) => {

    if (!util.validateCaller(ctx)) {
        return;
    }

    const output = {
        names: generateNames(ctx)
    };

    util.handleJsonp(ctx, {
        input: ctx.request.query,
        message: "OK",
        output,
        success: true
    });
});

datagenRouter.get('/datagen/haikunator.txt', async (ctx:Koa.ExtendableContext) => {

    ctx.body = generateNames(ctx).join('\n');

});

datagenRouter.get('/datagen/', async (ctx) => {
    ctx.redirect('/datagen/index.html');
});

datagenRouter.get('/datagen/index.html', async (ctx) => {
    ctx.redirect('/tools.html#experimental');
});

function getUrls():string[] {
    return [
        "/datagen/haikunator.html",
    ];
}

export {
    datagenRouter,
    getUrls
}
