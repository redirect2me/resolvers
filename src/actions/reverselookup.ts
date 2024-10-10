import { promises as dnsPromises } from 'dns';
import handlebars from 'handlebars';
import * as net from 'net';

import * as asn from "../data/maxmindData.js";
import * as resolvers from "../data/resolverData.js";
import * as streamer from "../streamer.js";
import * as util from "../util.js";

async function reverseDns(dnsResolver:dnsPromises.Resolver, ip:string): Promise<string>{

  try {
    return (await dnsResolver.reverse(ip)).join(',');
  }
  catch (err) {
    return err.message;
  }
}

async function reverseDnsApi(ctx: any, ip: string) {

    if (!util.validateCaller(ctx)) {
        return;
    }

    if (!ip) {
        util.handleJsonp(ctx, { success: false, message: `Missing 'ip' parameter`});
        return;
    }

  if (net.isIP(ip) == 0) {
        util.handleJsonp(ctx, { success: false, message: `${ip} is not a valid IP address` });
        return;
    }

  const asndata = asn.asnLookup(ip);
  const asnstr = asndata == null ? "(unknown)" : `${asndata.autonomous_system_organization} (${asndata.autonomous_system_number})`;

  try {
    const results = await new dnsPromises.Resolver().reverse(ip);
    util.handleJsonp(ctx, { success: true, input: ip, results, asn: asnstr });
  }
  catch (err) {
    util.handleJsonp(ctx, { asn: asnstr, success: false, message: `reverse lookup failed: ${err.message}` });
  }
}

async function reverseLookupAPIGet(ctx: any) {
    await reverseDnsApi(ctx, ctx.query.ip);
}

async function reverseLookupAPIPost(ctx: any) {
    await reverseDnsApi(ctx, ctx.request.body.ip);
}

async function reverseLookupGet(ctx: any) {
    ctx.body = await ctx.render('dns/reverse-lookup.hbs', {
        ip: ctx.query.ip,
    title: 'Reverse DNS Lookup',
    titleimg: '/images/boomerang.svg',
  });
}

async function reverseLookupPost(ctx: any) {

  const ip = ctx.request.body.ip;
  if (!ip) {
    ctx.flash('error', 'You must enter an IP address to check!');
    ctx.redirect('/dns/reverse-lookup.html');
    return;
  }

  if (net.isIP(ip) == 0) {
    ctx.flash('error', `${handlebars.escapeExpression(ip)} is not a valid IP address!`);
    ctx.redirect(`/dns/reverse-lookup.html?ip=${encodeURIComponent(ip)}`);
    return;
  }

  streamer.streamResponse(ctx, `Reverse DNS Lookup for ${ip}`, async (stream) => {

    for (const resolver of resolvers.getAll()) {
      for (const configKey of Object.keys(resolver.config)) {
        const config = resolver.config[configKey];
        const dnsResolver = new dnsPromises.Resolver();
        dnsResolver.setServers(config.ipv4);
        stream.write(`<p>${resolver.name} (${configKey}): `);
        const results = await dnsResolver.reverse(ip);
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

    stream.write(`<p><a class="btn btn-primary" href="/dns/reverse-lookup.html?ip=${encodeURIComponent(ip)}">Continue</a>`);
  });
}

export {
  reverseDns,
  reverseLookupGet,
  reverseLookupPost,
  reverseLookupAPIGet,
  reverseLookupAPIPost
}
