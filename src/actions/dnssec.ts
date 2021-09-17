import { promises as dnsPromises } from 'dns';
import * as psl from 'psl';

import * as util from '../util';

async function dnssecCheckGet(ctx:any) {
  ctx.body = await ctx.render('dns/dnssec-check.hbs', {
    domain: ctx.query.domain,
    title: 'DNSSEC Check'
  });
}

async function dnssecCheckPost(ctx:any) {
    const domainInput = ctx.request.body.domains;

    const domains = domainInput ? domainInput.trim().split(/,|\s/).map((s:string) => s.trim()).filter((x:string) => x.trim().length > 0) : null;

    ctx.body = await ctx.render('dns/dnssec-check.hbs', {
        title: 'DNSSEC Check',
        rows: domains && domains.length > 5 ? domains.length : 5,
        domainInput: domains && domains.length > 1 ? domains.join('\n') : domainInput,
        domains,
    });
}

async function dnssecCheckApiGet(ctx:any) {
    const domain = util.getFirst(ctx.query['domain']) || '';

    await dnssecCheckApiLow(ctx, domain);
}

async function dnssecCheckApiPost(ctx:any) {
    const domain = ctx.request.body.domain;

    await dnssecCheckApiLow(ctx, domain);
}

async function dnssecCheckApiLow(ctx:any, domain:string) {
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
            'message': `DNS lookup failed: ${err}`,
            domain
        });
    }
}

export {
    dnssecCheckApiGet,
    dnssecCheckApiPost,
    dnssecCheckGet,
    dnssecCheckPost
}
