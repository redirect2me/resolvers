import axios, { AxiosResponse } from 'axios';

import config from '../config';

async function ipapiisLookup(ctx:any) {
    const ip = ctx.query['ip'];

    if (!ip) {
        ctx.body = {
            success: false,
            message: `Missing 'ip' parameter`
        };
        return;
    }

    const apiKey = config.get('ipapiisApiKey');
    if (!apiKey) {
        ctx.body = {
            success: false,
            message: `IPAPIIS_API_KEY not configured`
        };
        return;
    }

    let retVal:any = {};

    const instance = axios.create({
        maxRedirects: 0,
        timeout: 5000,
        validateStatus: () => true
    });

    try {
        const response: AxiosResponse<any> = await instance.get(`https://api.ipapi.is/?q=${encodeURIComponent(ip)}&key=${apiKey}`);
        retVal.success = response.status == 200;
        retVal.message = `Status from api.ipapi.is: ${response.status}`;
        retVal.ip = ip;
        retVal.raw = response.data;
        if (response.data.location) {
            retVal.country = response.data.location.country_code;
            retVal.latitude = response.data.location.latitude;
            retVal.longitude = response.data.location.longitude;
            retVal.text = `${response.data.location.city}, ${response.data.location.state}, ${response.data.location.country}`;
        }
        ctx.log.debug({ data: retVal, ip, provider: 'ipapiis' }, 'Geolocation result')
    } catch (err) {
        retVal.success = false;
        retVal.message = err.message;
        ctx.log.warn({ data: retVal, err, ip, provider: 'ipapiis' }, 'Geolocation error')
    }

    ctx.body = retVal;
}

export {
    ipapiisLookup,
}
