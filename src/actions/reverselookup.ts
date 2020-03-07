import { promises as dnsPromises } from 'dns';
import { default as isIp } from 'is-ip';

import * as asn from '../data/maxmindData';
import * as resolvers from '../data/resolverData';
import * as streamer from '../streamer';
import * as util from '../util';

async function reverseDns(dnsResolver:dnsPromises.Resolver, ip:string): Promise<string>{

  try {
    return (await dnsResolver.reverse(ip)).join(',');
  }
  catch (err) {
    return err.message;
  }
}

async function reverseDnsApi(ctx: any, ipaddress: string) {

    if (!util.validateCaller(ctx)) {
        return;
    }

    if (!ipaddress) {
        util.handleJsonp(ctx, { success: false, message: `Missing 'ipaddress' parameter`});
        return;
    }

    if (!isIp(ipaddress)) {
        util.handleJsonp(ctx, { success: false, message: `${ipaddress} is not a valid IP address` });
        return;
    }

  const asndata = asn.asnLookup(ipaddress);
  const asnstr = asndata == null ? "(unknown)" : `${asndata.autonomous_system_organization} (${asndata.autonomous_system_number})`;

  try {
    const results = await new dnsPromises.Resolver().reverse(ipaddress);
    util.handleJsonp(ctx, { success: true, input: ipaddress, results, asn: asnstr });
  }
  catch (err) {
    util.handleJsonp(ctx, { asn: asnstr, success: false, message: `reverse lookup failed: ${err.message}` });
  }
}

async function reverseLookupAPIGet(ctx: any) {
    await reverseDnsApi(ctx, ctx.query.ipaddress);
}

async function reverseLookupAPIPost(ctx: any) {
    await reverseDnsApi(ctx, ctx.request.body.ipaddress);
}

async function reverseLookupGet(ctx: any) {
    ctx.body = await ctx.render('dns/reverse-lookup.hbs', {
    ipaddress: ctx.query.ipaddress,
    title: 'Reverse DNS Lookup'
  });
}

async function reverseLookupPost(ctx: any) {

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
}

export {
  reverseDns,
  reverseLookupGet,
  reverseLookupPost,
  reverseLookupAPIGet,
  reverseLookupAPIPost
}
