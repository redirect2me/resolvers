import * as whoiser from 'whoiser';

import * as util from "../util.js";

async function expirationCheckGet(ctx:any) {

    const domainInput = util.getFirst(ctx.query.domains) || '';

    await expirationCheckLow(ctx, domainInput);
}

async function expirationCheckPost(ctx:any) {

    const domainInput = ctx.request.body.domains;

    await expirationCheckLow(ctx, domainInput);
}

async function expirationCheckLow(ctx:any, domainInput:string) {

    const domains = domainInput ? domainInput.trim().split(/,|\s/).map((s:string) => s.trim()).filter((x:string) => x.trim().length > 0) : null;

    ctx.body = await ctx.render('domains/expiration-check.hbs', {
        title: 'Expiration Check',
        rows: domains && domains.length > 5 ? domains.length : 5,
        domainInput,
        domains,
    });
}

async function expirationCheckApiGet(ctx:any) {
    const domain = util.getFirst(ctx.query['domain']) || '';

    await expirationCheckApiLow(ctx, domain);
}

async function expirationCheckApiPost(ctx:any) {
    const domain = ctx.request.body.domain;

    await expirationCheckApiLow(ctx, domain);
}

async function expirationCheckApiLow(ctx:any, domain:string) {
    if (!util.validateCaller(ctx)) {
        return;
    }

    domain = domain.trim();

    if (!domain) {
        util.handleJsonp(ctx, {
            'success': false,
            'message': `Missing 'domain' parameter`
        });
        return;
    }

    if (!util.hasValidPublicSuffix(domain)) {
        util.handleJsonp(ctx, {
            'success': false,
            'message': 'Not a valid top level domain',
            domain
        });
        return;
    }

    try {
        const results = await whoiser.domain(domain);

        util.handleJsonp(ctx, {
            success: true,
            message: makeMessage(results),
            domain,
            raw: results
        });
    } catch (err) {
        util.handleJsonp(ctx, {
            'success': false,
            'message': `Whois lookup failed: ${err}`,
            domain
        });
    }
}

function makeMessage(results:any): string {
  for (const propName of Object.getOwnPropertyNames(results)) {
    if (results[propName]["Expiry Date"]) {
      return results[propName]["Expiry Date"];
    }
  }
  return "(unknown)";
}

export {
    expirationCheckApiGet,
    expirationCheckApiPost,
    expirationCheckGet,
    expirationCheckPost
}
