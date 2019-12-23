import { promises as dnsPromises } from 'dns';
import { default as isIp } from 'is-ip';
import Router from 'koa-router';

import * as resolvers from './resolvers';
import * as streamer from './streamer';

const reverseRouter = new Router();

async function reverseDns(dnsResolver:dnsPromises.Resolver, ip:string): Promise<string>{

  try {
    return (await dnsResolver.reverse(ip)).join(',');
  }
  catch (err) {
    return err.message;
  }
}

reverseRouter.get('/reverse-dns-lookup.html', async (ctx: any) => {
  ctx.body = await ctx.render('reverse-dns-lookup.hbs', {
    ipaddress: ctx.query.ipaddress,
    title: 'Reverse DNS Lookup'
  });
});

reverseRouter.post('/reverse-dns-lookup.html', async (ctx: any) => {

  const ipaddress = ctx.request.body.ipaddress;
  if (!ipaddress) {
    ctx.flash('error', 'You must enter an IP address to check!');
    ctx.redirect('/reverse-dns-lookup.html');
    return;
  }

  if (!isIp(ipaddress)) {
    ctx.flash('error', `${Handlebars.escapeExpression(ipaddress)} is not a valid IP address!`);
    ctx.redirect(`/reverse-dns-lookup.html?hostname=${encodeURIComponent(ipaddress)}`);
    return;
  }

  streamer.streamResponse(ctx, `Reverse DNS Lookup for ${ipaddress}`, async (stream) => {

    for (const resolver of resolvers.getAll()) {
      for (const configKey of Object.keys(resolver.config)) {
        const config = resolver.config[configKey];
        const dnsResolver = new dnsPromises.Resolver();
        dnsResolver.setServers(config.ipv4);
        stream.write(`<p>${resolver.name} (${configKey}): `);
        const results = await dnsResolver.reverse(ipaddress);
        stream.write('<ul>');
        for (const result of results) {
          stream.write(`<li>${result}</li>`);
        }
        stream.write('</ul>');
      }
    }
    stream.write(`<div class="alert alert-info">`);
    stream.write(`Complete`);
    stream.write(`</div>`);

    stream.write(`<p><a class="btn btn-primary" href="/reverse-dns-lookup.html?ipaddress=${encodeURIComponent(ipaddress)}">Continue</a>`);
  });
});

export {
  reverseDns,
  reverseRouter
}
