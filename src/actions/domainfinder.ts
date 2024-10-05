import { promises as dnsPromises } from 'dns';
import Handlebars from 'handlebars';

import { niceTlds as tlds } from "../data/domainData.js";
import * as streamer from "../streamer.js";

async function domainFinderGet(ctx:any) {
  ctx.body = await ctx.render('domains/finder.hbs', {
    word: ctx.query.word,
    title: 'Domain Name Finder'
  });
}

async function domainFinderPost(ctx:any) {

  let word = ctx.request.body.word;
  if (!word) {
    ctx.flash('error', 'You must enter a word!');
    ctx.redirect('finder.html');
    return;
  }

  word = word.toLowerCase().trim();

  if (!word.match(/^[a-z0-9]+/)) {
    ctx.flash('error', `${Handlebars.escapeExpression(word)} is not a valid word: it can only contain a-z and 0-9!`);
    ctx.redirect(`finder.html?word=${encodeURIComponent(word)}`);
    return;
  }

  async function checkHostname(dnsResolver:any, hostname:string): Promise<string> {
      try {
        const result = await dnsResolver.resolve4(hostname);
        if (result && result.length) {
            return `<a href="https://${hostname}/">Y</a>`;
        }
      } catch (err) {
      }
      return '-';
    }

  streamer.streamResponse(ctx, `Find available domains for ${word}`, async (stream) => {

    stream.write(`<div class="alert alert-info">In this context, <i>Available</i> really means that it is not configured at the registrar, which is a good but not perfect indication of availability</div>`);

    //stream.write(`<details>`);
    //stream.write(`<summary>DNS lookup of MX records</summary>`);
    const dnsResolver:any = new dnsPromises.Resolver();
    dnsResolver.setServers(['1.1.1.1']);


    //LATER: sort results by priority, then exchange
    stream.write(`<table class="table table-striped border-bottom">`);
    stream.write(`<thead><tr><th>Domain</th><th>Name Servers</th><th>Web Servers</th></tr></thead>`)
    stream.write(`<tbody>`)

    //const addresses:string[] = [];
    for (const tld of tlds) {

        const domain = `${word}.${tld}`;
        let nsResults:string = '';
        let hasNS = false;
        try {
            const ns = await dnsResolver.resolveNs(domain);
            nsResults = `<details><summary>${ns.length}</summary>${JSON.stringify(ns)}</details>`;
            hasNS = true;
        } catch (err) {
            nsResults = 'Available';
        }

        let aResults = '';
        if (hasNS) {
            aResults = `${await checkHostname(dnsResolver, domain)}/${await checkHostname(dnsResolver, 'www.' + domain)}`;
        }

        stream.write(`<tr>`);
        stream.write(`<td><a href="http://${domain}/">${domain}</a></td>`);
        stream.write(`<td>${nsResults}</td>`);
        stream.write(`<td>${aResults}</td>`);
        //LATER: affiliate links
        //LATER: option to double-check web servers for https/etc
        stream.write(`</tr>`);
    }

    stream.write(`</tbody></table>`);
    //stream.write(`</details>`);

    stream.write(`<div class="alert alert-info">`);
    stream.write(`Complete`);
    stream.write(`</div>`);

    stream.write(`<p><a class="btn btn-primary" href="finder.html?word=${encodeURIComponent(word)}">Continue</a>`);
  });
}

export {
    domainFinderGet,
    domainFinderPost
}
