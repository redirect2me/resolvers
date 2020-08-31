import axios from 'axios';
//import * as url from 'URL';

import config from '../config';
//import { logger } from '../logger';
//import * as util from '../util';

async function ipstackLookup(ctx:any) {
    const ip = ctx.query['ip'];

    if (!ip) {
        ctx.body = {
            success: false,
            message: `Missing 'ip' parameter`
        };
        return;
    }

    const apiKey = config.get('ipstackApiKey');
    if (!apiKey) {
        ctx.body = {
            success: false,
            message: `IPSTACK_API_KEY not configured`
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
        const response = await instance.get(`http://api.ipstack.com/${encodeURIComponent(ip)}?access_key=${apiKey}&format=1`);
        retVal.success = response.status == 200;
        retVal.message = `Status from api.ipstack.com: ${response.status}`;
        retVal.ip = ip;
        retVal.country = response.data.country_code;
        retVal.latitude = response.data.latitude;
        retVal.longitude = response.data.longitude;
        retVal.text = `${response.data.city}, ${response.data.region_name}, ${response.data.country_name}`;
        retVal.raw = response.data;
    } catch (err) {
        ctx.log.error({ err, ip }, 'Unable to check ip with ipstack');
        retVal.success = false;
        retVal.message = err.message;
    }

    console.log(retVal);

    ctx.body = retVal;
}

export {
    ipstackLookup,
}
