import Handlebars from 'handlebars';
import { default as isIp } from 'is-ip';

import * as asn from '../data/maxmindData';
import * as util from '../util';

async function asnLookupApi(ctx: any, ip: string) {

    if (!util.validateCaller(ctx)) {
        return;
    }

    if (!ip) {
        util.handleJsonp(ctx, { success: false, message: `Missing 'ip' parameter`});
        return;
    }

    if (!isIp(ip)) {
        util.handleJsonp(ctx, { success: false, message: `${ip} is not a valid IP address` });
        return;
    }

    const asndata = asn.asnLookup(ip);
    if (asndata == null) {
        util.handleJsonp(ctx, {
            input: ip,
            message: "Unknown ASN",
            success: false
         });
    } else {
        util.handleJsonp(ctx, {
            data: asndata,
            input: ip,
            message: `${asndata.autonomous_system_organization} (${asndata.autonomous_system_number})`,
            success: true
        });
    }
}

async function asnLookupAPIGet(ctx: any) {
    await asnLookupApi(ctx, ctx.query.ip);
}

async function asnLookupAPIPost(ctx: any) {
    await asnLookupApi(ctx, ctx.request.body.ip);
}

async function asnLookupGet(ctx: any) {

  const ip = ctx.query.ip || util.getCurrentIP(ctx);

  if (!isIp(ip)) {
    ctx.flash('error', `${Handlebars.escapeExpression(ip)} is not a valid IP address!`);
  }

  const asndata = asn.asnLookup(ip);

  ctx.body = await ctx.render('ip/asn-lookup.hbs', {
    asndata,
    ip,
    title: 'ASN Lookup'
  });
}

export {
  asnLookupGet,
  asnLookupAPIGet,
  asnLookupAPIPost
}
