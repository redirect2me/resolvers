import { promises as dnsPromises } from 'dns';
import * as psl from 'psl';

import * as util from '../util';

async function mxCheckGet(ctx:any) {

    const domainInput = util.getFirst(ctx.query.domains) || '';

    await mxCheckLow(ctx, domainInput);
}

async function mxCheckPost(ctx:any) {

    const domainInput = ctx.request.body.domains;

    await mxCheckLow(ctx, domainInput);
}

async function mxCheckLow(ctx:any, domainInput:string) {

    const domains = domainInput ? domainInput.trim().split(/,|\s/).map((s:string) => s.trim()).filter((x:string) => x.trim().length > 0) : null;

    ctx.body = await ctx.render('dns/mx-check.hbs', {
        title: 'MX Check',
        rows: domains && domains.length > 5 ? domains.length : 5,
        domainInput,
        domains,
    });
}

async function mxCheckApiGet(ctx:any) {
    const domain = util.getFirst(ctx.query['domain']) || '';

    await mxCheckApiLow(ctx, domain);
}

async function mxCheckApiPost(ctx:any) {
    const domain = ctx.request.body.domain;

    await mxCheckApiLow(ctx, domain);
}

async function mxCheckApiLow(ctx:any, domain:string) {
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
            message: makeMxMessage(results),
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

//LATER: load from /data
const companyMap:any = {
    "google.com": "Google",
    "googlemail.com": "Google",
    "outlook.com": "Microsoft",
}

function domainToCompany(domain:string):string {
    return companyMap[domain] || domain;
}

function makeMxMessage(results:any):string {
    if (!results || results.length == 0) {
        return '(none)';
    }

    const companies:Set<string> = new Set<string>();

    for (const result of results) {
        try {
            const tld = psl.get(result.exchange);
            if (!tld) {
                companies.add(result.exchange);
            } else {
                companies.add(domainToCompany(tld));
            }
        }
        catch (err) {
            companies.add(result.exchange);
        }
    }

    return Array.from(companies).sort().join('\n');
}

export {
    mxCheckApiGet,
    mxCheckApiPost,
    mxCheckGet,
    mxCheckPost
}
