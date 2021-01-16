import { promises as dnsPromises } from 'dns';
import Handlebars from 'handlebars';
import Router from 'koa-router';
import * as psl from 'psl';

import * as mxcheck from '../actions/mxcheck';
import * as resolvers from '../data/resolverData';
import * as reverselookup from '../actions/reverselookup';
import * as streamer from '../streamer';

const dnsRouter = new Router();

dnsRouter.get('/dns/', async (ctx) => {
    ctx.redirect('/dns/index.html');
});

dnsRouter.get('/dns/index.html', async (ctx) => {
    ctx.redirect('/tools.html#dns');
});

dnsRouter.get('/dns/lookup.html', async (ctx:any) => {
  ctx.body = await ctx.render('dns/lookup.hbs', {
    hostname: ctx.query.hostname,
    title: 'DNS Lookup'
  });
});

dnsRouter.post('/dns/lookup.html', async (ctx:any) => {

  const hostname = ctx.request.body.hostname;
  if (!hostname) {
    ctx.flash('error', 'You must enter a hostname to check!');
    ctx.redirect('/dns/lookup.html');
    return;
  }

  if (!psl.isValid(hostname)) {
    ctx.flash('error', `${Handlebars.escapeExpression(hostname)} is not a valid hostname!`);
    ctx.redirect(`/dns/lookup.html?hostname=${encodeURIComponent(hostname)}`);
    return;
  }

  streamer.streamResponse(ctx, `DNS Lookup for ${hostname}`, async (stream) => {

    for (const resolver of resolvers.getAll()) {
      for (const configKey of Object.keys(resolver.config)) {
        const config = resolver.config[configKey];
        const dnsResolver = new dnsPromises.Resolver();
        dnsResolver.setServers(config.ipv4);
        stream.write(`<p>${resolver.name} (${configKey}): `);
        const results = await dnsResolver.resolve4(hostname);
        for (const result of results) {
          stream.write(`${result} `);
          //stream.write(`(${ await reverseDns(dnsResolver, result)})`);
        }
      }
    }
/*
    const result = await dnsPromises.resolve(hostname);

    stream.write("<details>");
    stream.write(`<summary>${JSON.stringify(result)}</summary>`);
    stream.write("<pre>");
    stream.write(JSON.stringify({}, null, 2));
    stream.write("</pre>");
    stream.write("</details>");
*/

    stream.write(`<div class="alert alert-info">`);
    stream.write(`Complete`);
    stream.write(`</div>`);

    stream.write(`<p><a class="btn btn-primary" href="/dns/lookup.html?hostname=${encodeURIComponent(hostname)}">Continue</a>`);
  });
});

dnsRouter.get('/dns/mxcheck.json', mxcheck.mxCheckJson);
dnsRouter.get('/dns/mxcheck.html', mxcheck.mxCheckGet);
dnsRouter.post('/dns/mxcheck.html', mxcheck.mxCheckPost);
dnsRouter.get('/dns/reverse-lookup.html', reverselookup.reverseLookupGet);
dnsRouter.post('/dns/reverse-lookup.html', reverselookup.reverseLookupPost);
dnsRouter.get('/dns/reverse-lookup.json', reverselookup.reverseLookupAPIGet);
dnsRouter.post('/dns/reverse-lookup.json', reverselookup.reverseLookupAPIPost);

function getUrls():string[] {
    return [
        "/dns/lookup.html",
        "/dns/mxcheck.html",
        "/dns/reverse-lookup.html",
    ];
}

export {
    getUrls,
    dnsRouter
}
