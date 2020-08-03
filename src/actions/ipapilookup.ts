import axios from 'axios';
//import * as url from 'URL';

//import { logger } from '../logger';
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

    let retVal = {
        success: true,
        message: '',
        data: {},
    }

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

        retVal = response.data;
        retVal.success = true;

    } catch (err) {
        ctx.log.error({ err, ip }, 'Unable to check ip with ip-api');
        retVal.success = false;
        retVal.message = err.message;
    }

    console.log(retVal);

    ctx.body = retVal;
}

export {
    ipapiLookup,
}
