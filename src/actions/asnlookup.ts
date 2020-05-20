import Handlebars from 'handlebars';
import { default as isIp } from 'is-ip';

import * as asn from '../data/maxmindData';
import * as util from '../util';

async function asnLookupApi(ctx: any, ipaddress: string) {

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
    if (asndata == null) {
        util.handleJsonp(ctx, {
            input: ipaddress,
            message: "Unknown ASN",
            success: false
         });
    } else {
        util.handleJsonp(ctx, {
            input: ipaddress,
            message: `${asndata.autonomous_system_organization} (${asndata.autonomous_system_number})`,
            data: asndata,
            success: true
        });
    }
}

async function asnLookupAPIGet(ctx: any) {
    await asnLookupApi(ctx, ctx.query.ipaddress);
}

async function asnLookupAPIPost(ctx: any) {
    await asnLookupApi(ctx, ctx.request.body.ipaddress);
}

async function asnLookupGet(ctx: any) {

  const ipaddress = ctx.query.ipaddress || util.getCurrentIP(ctx);

  if (!isIp(ipaddress)) {
    ctx.flash('error', `${Handlebars.escapeExpression(ipaddress)} is not a valid IP address!`);
  }

  const asndata = asn.asnLookup(ipaddress);

  ctx.body = await ctx.render('ip/asn-lookup.hbs', {
    asndata,
    ipaddress,
    title: 'ASN Lookup'
  });
}

export {
  asnLookupGet,
  asnLookupAPIGet,
  asnLookupAPIPost
}
