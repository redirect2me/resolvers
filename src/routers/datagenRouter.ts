//import { promises as fsPromises } from 'fs';
import Haikunator from 'haikunator';
//import Handlebars from 'handlebars';
import Koa from 'koa';
import Router from 'koa-router';

import * as util from '../util';

const datagenRouter = new Router();

function generateName(ctx: any): string {
    var haikunator = new Haikunator({
        defaults: {
            tokenLength: util.safeParseInt(ctx.request.query.tokenLength, 2),
            tokenChars: ctx.request.query.tokenChars || '23456789',
        }
    });

    let name = haikunator.haikunate();

    return name;
}

datagenRouter.get('/datagen/haikunator.html', async (ctx: any) => {

    ctx.body = await ctx.render('datagen/haikunator.hbs', {
        name: generateName(ctx),
        title: 'Heroku-style Name Generator',
    });

});

datagenRouter.all('/datagen/haikunator.json', async (ctx:Koa.ExtendableContext) => {

    const output = {
        name: generateName(ctx)
    };

    util.handleJsonp(ctx, {
        input: ctx.request.query,
        message: "OK",
        output,
        success: true
    });
});

datagenRouter.get('/datagen/', async (ctx) => {
    ctx.redirect('/datagen/index.html');
});

datagenRouter.get('/datagen/index.html', async (ctx) => {
    ctx.redirect('/tools.html#datagen');
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
