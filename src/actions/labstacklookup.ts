import axios from 'axios';
//import * as url from 'URL';

import config from '../config';
//import { logger } from '../logger';
//import * as util from '../util';

async function labstackLookup(ctx:any) {
    const ip = ctx.query['ip'];

    if (!ip) {
        ctx.body = {
            success: false,
            message: `Missing 'ip' parameter`
        };
        return;
    }

    const apiKey = config.get('labstackApiKey');
    if (!apiKey) {
        ctx.body = {
            success: false,
            message: `LABSTACK_API_KEY not configured`
        };
        return;
    }

    let retVal:any = {};

    const instance = axios.create({
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'User-Agent': 'resolve.rs/1.0'
        },
        maxRedirects: 0,
        timeout: 5000,
        validateStatus: () => true
    });

    try {
        const response = await instance.get(`https://ip.labstack.com/api/v1/${encodeURIComponent(ip)}`);
        retVal.success = response.status == 200;
        retVal.message = `Status from ip.labstack.com: ${response.status}`;
        retVal.ip = ip;
        retVal.country = response.data.country_code;
        retVal.latitude = response.data.latitude;
        retVal.longitude = response.data.longitude;
        retVal.text = `${response.data.city}, ${response.data.region}, ${response.data.country}`;
        retVal.raw = response.data;
    } catch (err) {
        ctx.log.error({ err, ip }, 'Unable to check ip with labstack');
        retVal.success = false;
        retVal.message = err.message;
    }

    console.log(retVal);

    ctx.body = retVal;
}

export {
    labstackLookup,
}
