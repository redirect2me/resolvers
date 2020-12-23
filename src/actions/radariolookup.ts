import axios from 'axios';

import config from '../config';

async function radarioLookup(ctx:any) {
    const ip = ctx.query['ip'];

    if (!ip) {
        ctx.body = {
            success: false,
            message: `Missing 'ip' parameter`
        };
        return;
    }

    const apiKey = config.get('radarioApiKey');
    if (!apiKey) {
        ctx.body = {
            success: false,
            message: `RADARIO_API_KEY not configured`
        };
        return;
    }

    let retVal:any = {};

    const instance = axios.create({
        headers: {
            'Authorization': `${apiKey}`,
            'User-Agent': 'resolve.rs/1.0'
        },
        maxRedirects: 0,
        timeout: 5000,
        validateStatus: () => true
    });

    try {
        const response = await instance.get(`https://api.radar.io/v1/geocode/ip?ip=${encodeURIComponent(ip)}`);
        retVal.success = response.status == 200;
        retVal.message = `Status from api.radario.com: ${response.status}`;
        retVal.ip = ip;
        retVal.raw = response.data;
        retVal.country = response.data.address.countryCode;
        retVal.latitude = response.data.address.latitude;
        retVal.longitude = response.data.address.longitude;
        retVal.text = `${response.data.address.city}, ${response.data.address.state}, ${response.data.address.country}`;
        ctx.log.debug({ data: retVal, ip, provider: 'radario' }, 'Geolocation result')
    } catch (err) {
        retVal.success = false;
        retVal.message = err.message;
        ctx.log.warn({ data: retVal, err, ip, provider: 'radario' }, 'Geolocation error')
    }

    ctx.body = retVal;
}

export {
    radarioLookup,
}
