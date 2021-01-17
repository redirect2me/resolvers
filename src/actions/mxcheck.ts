import { promises as dnsPromises } from 'dns';
import Handlebars from 'handlebars';
import * as psl from 'psl';

import * as streamer from '../streamer';
import * as util from '../util';

async function mxCheckGet(ctx:any) {
  ctx.body = await ctx.render('dns/mxcheck.hbs', {
    domain: ctx.query.domain,
    title: 'MX Check'
  });
}

async function mxCheckPost(ctx:any) {

  const domain = ctx.request.body.domain;
  if (!domain) {
    ctx.flash('error', 'You must enter a domain to check!');
    ctx.redirect('mxcheck.html');
    return;
  }

  if (!psl.isValid(domain)) {
    ctx.flash('error', `${Handlebars.escapeExpression(domain)} is not a valid domain!`);
    ctx.redirect(`mxcheck.html?domain=${encodeURIComponent(domain)}`);
    return;
  }

  streamer.streamResponse(ctx, `MX check for ${domain}`, async (stream) => {

    stream.write(`<details>`);
    stream.write(`<summary>DNS lookup of MX records</summary>`);
    const dnsResolver:any = new dnsPromises.Resolver();
    dnsResolver.setServers(['1.1.1.1']);

    const results = await dnsResolver.resolveMx(domain);

    //LATER: sort results by priority, then exchange
    stream.write(`<table class="table table-striped">`);
    stream.write(`<thead><tr><th>Server</th><th>Priority</th><th>Address</th></tr></thead>`)
    stream.write(`<tbody>`)

    const addresses:string[] = [];
    for (const row of results) {
        stream.write(`<tr>`);
        stream.write(`<td>${row.exchange}</td>`);
        stream.write(`<td>${row.priority}</td>`);
        stream.write(`<td>`);
        try {
            const ip4address = await dnsResolver.resolve4(row.exchange);
            stream.write(`IPv4: ${ip4address}<br/>`);
            addresses.push(ip4address);
        }
        catch (err) {
            stream.write(`IPv4: ${err.message}`); //LATER: html encode
        }
        try {
            const ip6address = await dnsResolver.resolve6(row.exchange);
            stream.write(`IPv6: ${ip6address}<br/>`);
            addresses.push(ip6address);
        }
        catch (err) {
            stream.write(`IPv6: ${err.message}`); //LATER: html encode
        }
        stream.write(`</td>`);
        stream.write(`</tr>`);

    }
    stream.write(`</tbody></table>`);
    //stream.write(`<p>${JSON.stringify(results)}</p>`)
    stream.write(`</details>`);

    //LATER: check all addresses


    stream.write(`<div class="alert alert-info">`);
    stream.write(`Complete`);
    stream.write(`</div>`);

    stream.write(`<p><a class="btn btn-primary" href="mxcheck.html?domain=${encodeURIComponent(domain)}">Continue</a>`);
  });
}
async function mxCheckJson(ctx:any) {

    const domain = ctx.request.query['domain'];
    if (!domain) {
        util.handleJsonp(ctx, {
            'success': false,
            'message': 'No domain specified'
        });
        return;
    }

    if (!psl.isValid(domain)) {
        util.handleJsonp(ctx, {
            'success': false,
            'message': 'Not a valid top level domain',
            domain
        });
        return;
    }

    const dnsResolver:any = new dnsPromises.Resolver();
    dnsResolver.setServers(['1.1.1.1']);

    try {
        const results = await dnsResolver.resolveMx(domain);

        util.handleJsonp(ctx, {
            success: true,
            mailservers: results
        });
    } catch (err) {
        util.handleJsonp(ctx, {
            'success': false,
            'message': 'DNS lookup failed: ${err.getMessage()}',
            domain
        });
    }
}

export {
    mxCheckGet,
    mxCheckJson,
    mxCheckPost
}
