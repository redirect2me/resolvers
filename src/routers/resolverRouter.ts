import { promises as dnsPromises } from 'dns';
import Router from 'koa-router';
import * as psl from 'psl';

import * as resolvers from '../data/resolverData';
import * as streamer from '../streamer';

const resolverRouter = new Router();

resolverRouter.get('/resolvers/:resolver/', async (ctx) => {
  await ctx.redirect('index.html');
});

resolverRouter.get('/resolvers/:resolver/index.html', async (ctx: any) => {

  const resolverData = resolvers.get(ctx.params.resolver);
  if (!resolverData) {
    ctx.flash('error', `Sorry, we don't have any info for an open resolver "${ctx.params.resolver}".`)
    ctx.redirect("/resolvers/index.html");
    return;
  }
  ctx.body = await ctx.render('resolvers-detail.hbs', {
    hostname: ctx.query.hostname,
    title: resolverData.name,
    titleimg: resolverData.icon,
    resolver: resolverData
  });
});

resolverRouter.post('/resolvers/:resolver/index.html', async (ctx: any) => {

  const resolverData = resolvers.get(ctx.params.resolver);
  if (!resolverData) {
    ctx.flash('error', `Sorry, we don't have any info for an open resolver "${ctx.params.resolver}".`)
    ctx.redirect("/resolvers/index.html");
    return;
  }

  const hostname = ctx.request.body.hostname;
  if (!hostname) {
    ctx.flash('error', 'You must enter a hostname to check!');
    ctx.redirect('index.html');
    return;
  }

  if (!psl.isValid(hostname)) {
    ctx.flash('error', `${Handlebars.escapeExpression(hostname)} is not a valid hostname!`);
    ctx.redirect(`index.html?hostname=${encodeURIComponent(hostname)}`);
    return;
  }

  streamer.streamResponse(ctx, `DNS Results from ${resolverData.name} for ${hostname}`, async (stream) => {
    for (const configKey of Object.keys(resolverData.config)) {
      const config = resolverData.config[configKey];

      for (const ipv4 of config.ipv4) {
        const dnsResolver = new dnsPromises.Resolver();
        dnsResolver.setServers([ipv4]);
        stream.write(`<p>${ipv4}: `);
        const results = await dnsResolver.resolve4(hostname);
        stream.write("<ul>")
        for (const result of results) {
          stream.write(`<li>${result}</li>`);
        }
        stream.write("</ul>")
      }
    }

    stream.write(`<div class="alert alert-info">`);
    stream.write(`Complete`);
    stream.write(`</div>`);

    stream.write(`<p><a class="btn btn-primary" href="index.html?hostname=${encodeURIComponent(hostname)}">Continue</a>`);
  });
});

function getUrls():string[] {
    const urls = [
        "/resolvers/index.html"
    ]
    for (const resolver of resolvers.getAll()) {
      urls.push(`/resolvers/${resolver.key}/index.html`);
    }

    return urls;
}

export {
    getUrls,
    resolverRouter
}