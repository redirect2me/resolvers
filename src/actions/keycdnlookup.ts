import axios from 'axios';
//import * as url from 'URL';

import { logger } from '../logger';
//import * as util from '../util';

async function keycdnLookup(ctx:any) {
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
        validateStatus: function (status:number) {
            return status >= 200 && status < 400; // default
        }
    });


    try {
        const response = await instance.get(`https://tools.keycdn.com/geo.json?host=${encodeURIComponent(ip)}`);
        retVal.success = response.status == 200;
        retVal.message = `Status from tools.keycdn.com: ${response.status}`;
        retVal.ip = ip;
        retVal.country = response.data.data.geo.country_code;
        retVal.latitude = response.data.data.geo.latitude;
        retVal.longitude = response.data.data.geo.longitude;
        retVal.text = `${response.data.data.geo.city}, ${response.data.data.geo.region_name}, ${response.data.data.geo.country_name}`;
        retVal.raw = response.data;
    } catch (err) {
        ctx.log.error({ err, ip }, 'Unable to check ip with keycdn');
        retVal.success = false;
        retVal.message = err.message;
    }

    logger.debug( { geodata: retVal, ip }, "KeyCDN results");

    ctx.body = retVal;
}

export {
    keycdnLookup,
}
