//import { promises as fsPromises } from 'fs';
import Router from 'koa-router';
//import * as path from 'path';

const infoRouter = new Router();

infoRouter.get('/info/', async (ctx) => {
    ctx.redirect('/info/index.html');
});

infoRouter.get('/info/index.html', async (ctx) => {
    ctx.redirect('/tools.html#info');
});

infoRouter.get('/info/glossary.html', async (ctx:any) => {
    ctx.body = await ctx.render('info/glossary.hbs', {
        title: 'Glossary',
     });
});

infoRouter.get('/info/steps.html', async (ctx:any) => {
    ctx.body = await ctx.render('info/steps.hbs', {
        title: 'Steps to get a web page',
     });
});

function getUrls():string[] {
    return [
        "/info/glossary.html",
        "/info/steps.html",
    ];
}

export {
    getUrls,
    infoRouter
}
