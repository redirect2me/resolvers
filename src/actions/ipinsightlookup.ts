import axios from 'axios';

import config from '../config';

async function ipinsightLookup(ctx:any) {
    const ip = ctx.query['ip'];

    if (!ip) {
        ctx.body = {
            success: false,
            message: `Missing 'ip' parameter`
        };
        return;
    }

    const token = config.get('ipinsightToken');
    if (!token) {
        ctx.body = {
            success: false,
            message: `IPINSIGHT_TOKEN not configured`
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
        const response = await instance.get(`https://api.ipinsight.io/ip/${encodeURIComponent(ip)}?token=${token}`);
        retVal.success = response.status == 200;
        retVal.message = `Status from api.ipinsight.io: ${response.status}`;
        retVal.ip = ip;
        retVal.country = response.data.country_code;
        retVal.latitude = response.data.latitude;
        retVal.longitude = response.data.longitude;
        retVal.text = `${response.data.city_name}, ${response.data.region_name}, ${response.data.country_name}`;
        retVal.raw = response.data;
    } catch (err) {
        ctx.log.error({ err, ip }, 'Unable to check ip with ipinsight.io');
        retVal.success = false;
        retVal.message = err.message;
    }

    console.log(retVal);

    ctx.body = retVal;
}

export {
    ipinsightLookup,
}
