import axios, { AxiosResponse } from 'axios';

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
        headers: { 'User-Agent': 'keycdn-tools:https://resolve.rs/ip/geolocation.html' },
        maxRedirects: 0,
        timeout: 5000,
        validateStatus: () => true,
    });


    try {
        const response:AxiosResponse<any> = await instance.get(`https://tools.keycdn.com/geo.json?host=${encodeURIComponent(ip)}`);
        retVal.success = response.status == 200;
        retVal.message = `Status from tools.keycdn.com: ${response.status}`;
        retVal.ip = ip;
        retVal.raw = response.data;
        retVal.country = response.data.data.geo.country_code;
        retVal.latitude = response.data.data.geo.latitude;
        retVal.longitude = response.data.data.geo.longitude;
        retVal.text = `${response.data.data.geo.city}, ${response.data.data.geo.region_name}, ${response.data.data.geo.country_name}`;
        ctx.log.debug({ data: retVal, ip, provider: 'keycdn' }, 'Geolocation result')
    } catch (err) {
        retVal.success = false;
        retVal.message = err.message;
        ctx.log.warn({ data: retVal, err, ip, provider: 'keycdn' }, 'Geolocation error')
    }

    ctx.body = retVal;
}

export {
    keycdnLookup,
}
