import { promises as dnsPromises } from 'dns';
import Handlebars from 'handlebars';
import Router from 'koa-router';
import * as psl from 'psl';

import * as resolvers from './data/resolverData';
import * as streamer from './streamer';

const lookupRouter = new Router();

lookupRouter.get('/lookup.html', async (ctx) => {
  await ctx.redirect('/dns-lookup.html');
});

lookupRouter.get('/dns-lookup.html', async (ctx:any) => {
  ctx.body = await ctx.render('dns-lookup.hbs', {
    hostname: ctx.query.hostname,
    title: 'DNS Lookup'
  });
});


lookupRouter.post('/dns-lookup.html', async (ctx:any) => {

  const hostname = ctx.request.body.hostname;
  if (!hostname) {
    ctx.flash('error', 'You must enter a hostname to check!');
    ctx.redirect('/dns-lookup.html');
    return;
  }

  if (!psl.isValid(hostname)) {
    ctx.flash('error', `${Handlebars.escapeExpression(hostname)} is not a valid hostname!`);
    ctx.redirect(`/dns-lookup.html?hostname=${encodeURIComponent(hostname)}`);
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

    stream.write(`<p><a class="btn btn-primary" href="/dns-lookup.html?hostname=${encodeURIComponent(hostname)}">Continue</a>`);
  });
});

export {
  lookupRouter
}
