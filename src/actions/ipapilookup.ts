import axios from 'axios';
//import * as url from 'URL';

import { logger } from '../logger';
//import * as util from '../util';

async function ipapiLookup(ctx: any) {
    const ip = ctx.query['ip'];

    if (!ip) {
        ctx.body = {
            success: false,
            message: `Missing 'ip' parameter`
        };
        return;
    }

    let retVal:any = {};

    const instance = axios.create({
        headers: { 'User-Agent': 'resolve.rs/1.0' },
        maxRedirects: 0,
        timeout: 5000,
        validateStatus: function (status: number) {
            return status >= 200 && status < 400; // default
        }
    });


    try {
        const response = await instance.get(`http://ip-api.com/json/${encodeURIComponent(ip)}`);
        retVal.success = response.status == 200;
        retVal.message = `Status from ip-api.com: ${response.status}`;
        retVal.ip = ip;
        retVal.country = response.data.countryCode;
        retVal.latitude = response.data.lat;
        retVal.longitude = response.data.lon;
        retVal.text = `${response.data.city}, ${response.data.regionName}, ${response.data.country}`;
        retVal.raw = response.data;
    } catch (err) {
        ctx.log.error({ err, ip }, 'Unable to check ip with ip-api');
        retVal.success = false;
        retVal.message = err.message;
    }

    logger.debug( { geodata: retVal, ip }, "ip-api results");

    ctx.body = retVal;
}

export {
    ipapiLookup,
}
