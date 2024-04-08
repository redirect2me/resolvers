import { promises as dnsPromises } from 'dns';
import Handlebars from 'handlebars';
import Router from 'koa-router';

import * as dnssec from '../actions/dnssec';
import * as mxcheck from '../actions/mxcheck';
import * as nscheck from '../actions/nscheck';
import * as resolvers from '../data/resolverData';
import * as reverselookup from '../actions/reverselookup';
import * as streamer from '../streamer';
import * as util from '../util';

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
    title: 'DNS Lookup',
  });
});

dnsRouter.post('/dns/lookup.html', async (ctx:any) => {

  let hostname = ctx.request.body.hostname;
  if (!hostname) {
    ctx.flash('error', 'You must enter a hostname to check!');
    ctx.redirect('/dns/lookup.html');
    return;
  }

  if (!util.hasValidPublicSuffix(hostname)) {
    try {
      const url = new URL(hostname);
      hostname = url.hostname;
    } catch (err) {
      ctx.flash('error', `Unable to extract a hostname from "${Handlebars.escapeExpression(hostname)}"!`);
      ctx.redirect(`/dns/lookup.html?hostname=${encodeURIComponent(hostname)}`);
      return;
    }
    if (!util.hasValidPublicSuffix(hostname)) {
      ctx.flash('error', `${Handlebars.escapeExpression(hostname)} is not a valid hostname!`);
      ctx.redirect(`/dns/lookup.html?hostname=${encodeURIComponent(hostname)}`);
      return;
    }
  }

  streamer.streamResponse(ctx, `DNS Lookup for ${hostname}`, async (stream) => {

    for (const resolver of resolvers.getAll()) {
      for (const configKey of Object.keys(resolver.config)) {
        const config = resolver.config[configKey];
        const dnsResolver = new dnsPromises.Resolver();
        dnsResolver.setServers(config.ipv4);
        stream.write(`<p>${resolver.name} (${configKey}): `);
        try {
          const results = await dnsResolver.resolve4(hostname);
          for (const result of results) {
            stream.write(`${result} `);
          }
        } catch (err) {
          stream.write(`Error: ${err.message}`);
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

dnsRouter.get('/dns/mxcheck.html', (ctx:any) => {
  ctx.redirect('/dns/mx-check.html');
});

dnsRouter.get('/dns/dnssec-check.json', dnssec.dnssecCheckApiGet);
dnsRouter.post('/dns/dnssec-check.json', dnssec.dnssecCheckApiPost);
dnsRouter.get('/dns/dnssec-check.html', dnssec.dnssecCheckGet);
dnsRouter.post('/dns/dnssec-check.html', dnssec.dnssecCheckPost);
dnsRouter.get('/dns/mx-check.json', mxcheck.mxCheckApiGet);
dnsRouter.post('/dns/mx-check.json', mxcheck.mxCheckApiPost);
dnsRouter.get('/dns/mx-check.html', mxcheck.mxCheckGet);
dnsRouter.post('/dns/mx-check.html', mxcheck.mxCheckPost);
dnsRouter.get('/dns/ns-check.html', nscheck.nsCheckGet);
dnsRouter.post('/dns/ns-check.html', nscheck.nsCheckPost);
dnsRouter.get('/dns/reverse-lookup.html', reverselookup.reverseLookupGet);
dnsRouter.post('/dns/reverse-lookup.html', reverselookup.reverseLookupPost);
dnsRouter.get('/dns/reverse-lookup.json', reverselookup.reverseLookupAPIGet);
dnsRouter.post('/dns/reverse-lookup.json', reverselookup.reverseLookupAPIPost);

function getUrls():string[] {
    return [
      "/dns/dnssec-check.html",
      "/dns/lookup.html",
      "/dns/mx-check.html",
      "/dns/ns-check.html",
      "/dns/reverse-lookup.html",
    ];
}

export {
    getUrls,
    dnsRouter
}
