import { promises as fsPromises } from 'fs';
import Router from 'koa-router';
import * as path from 'path';

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

infoRouter.get('/info/tcp-ports.html', async (ctx: any) => {
    const portsFile = path.join(__dirname, '../..', 'data', 'tcp-ports.json');
    const ports = JSON.parse(await fsPromises.readFile(portsFile, 'utf-8'));
    ctx.body = await ctx.render('info/tcp-ports.hbs', {
        ports,
        title: 'Common TCP Ports',
    });
});

function getUrls():string[] {
    return [
        "/info/glossary.html",
        "/info/steps.html",
        "/info/tcp-ports.html",
    ];
}

export {
    getUrls,
    infoRouter
}
