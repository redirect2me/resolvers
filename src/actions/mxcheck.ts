//import { promises as dnsPromises } from 'dns';
import Handlebars from 'handlebars';
import Router from 'koa-router';
import * as psl from 'psl';

import * as streamer from '../streamer';

const mxCheckRouter = new Router();

mxCheckRouter.get('/dns/mxcheck.html', async (ctx:any) => {
  ctx.body = await ctx.render('dns/mxcheck.hbs', {
    domain: ctx.query.domain,
    title: 'MX Check'
  });
});


mxCheckRouter.post('/dns/mxcheck.html', async (ctx:any) => {

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

    stream.write(`<p>Coming soon!</p>`);

    stream.write(`<div class="alert alert-info">`);
    stream.write(`Complete`);
    stream.write(`</div>`);

    stream.write(`<p><a class="btn btn-primary" href="mxcheck.html?domain=${encodeURIComponent(domain)}">Continue</a>`);
  });
});

export {
    mxCheckRouter
}