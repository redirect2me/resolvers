import * as util from '../util';

async function nsCheckGet(ctx:any) {

  const domainInput = util.getFirst(ctx.query.domains) || '';

  await nsCheckLow(ctx, domainInput);
}

async function nsCheckPost(ctx:any) {

  const domainInput = ctx.request.body.domains;

  await nsCheckLow(ctx, domainInput);
}

async function nsCheckLow(ctx:any, domainInput:string) {

  const domains = domainInput ? domainInput.trim().split(/,|\s/).map((s:string) => s.trim()).filter((x:string) => x.trim().length > 0) : null;

  ctx.body = await ctx.render('dns/ns-check.hbs', {
      title: 'NS Check',
      rows: domains && domains.length > 5 ? domains.length : 5,
      domainInput,
      domains,
  });
}

export {
  nsCheckGet,
  nsCheckPost
}