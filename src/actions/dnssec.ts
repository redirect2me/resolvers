import axios, { AxiosResponse } from 'axios';
import * as psl from 'psl';

import * as util from '../util';

const axiosInstance = axios.create({
    headers: { 'User-Agent': 'resolve.rs/1.0' },
    maxRedirects: 0,
    timeout: 5000,
    validateStatus: () => true,
});

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

    let retVal:any = {};
    retVal.domain = domain;

    try {
        // https://developers.google.com/speed/public-dns/docs/doh/json
        const response: AxiosResponse<any> = await axiosInstance.get(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=a&do=1`);
        retVal.raw = response.data;
        if (response.status == 200) {
            if (response.data.AD) {
                retVal.success = true;
                if (response.data.Answer?.length > 0) {
                    retVal.message = 'DNSSEC configured and working';
                } else {
                    retVal.message = 'DNSSEC configured but no such hostname';
                }
            } else {
                retVal.success = false;
                if (response.data.Answer?.length > 0) {
                    retVal.message = 'DNSSEC not configured';
                } else {
                    retVal.message = 'Domain not found';
                }
            }
        } else {
            retVal.success = false;
            retVal.message = `Google DoH returned status ${response.status}`;
        }
    } catch (err) {
        retVal.success = false;
        retVal.message = `${err}`;
    }
    util.handleJsonp(ctx, retVal);
}

export {
    dnssecCheckApiGet,
    dnssecCheckApiPost,
    dnssecCheckGet,
    dnssecCheckPost
}
