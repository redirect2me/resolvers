import axios from 'axios';

import config from '../config';

async function abstractapiLookup(ctx:any) {
    const ip = ctx.query['ip'];

    if (!ip) {
        ctx.body = {
            success: false,
            message: `Missing 'ip' parameter`
        };
        return;
    }

    const apiKey = config.get('abstractapiApiKey');
    if (!apiKey) {
        ctx.body = {
            success: false,
            message: `ABSTRACTAPI_API_KEY not configured`
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
        const response = await instance.get(`https://ipgeolocation.abstractapi.com/v1/?api_key=${apiKey}&ip_address=${encodeURIComponent(ip)}`);
        retVal.success = response.status == 200;
        retVal.message = `Status from abstractapi.com: ${response.status}`;
        retVal.ip = ip;
        retVal.country = response.data.country_code;
        retVal.latitude = response.data.latitude;
        retVal.longitude = response.data.longitude;
        retVal.text = `${response.data.city}, ${response.data.region}, ${response.data.country}`;
        retVal.raw = response.data;
    } catch (err) {
        ctx.log.error({ err, ip }, 'Unable to check ip with abstractapi');
        retVal.success = false;
        retVal.message = err.message;
    }

    console.log(retVal);

    ctx.body = retVal;
}

export {
    abstractapiLookup,
}
