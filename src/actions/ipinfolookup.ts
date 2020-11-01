import axios from 'axios';

import config from '../config';

async function ipinfoLookup(ctx:any) {
    const ip = ctx.query['ip'];

    if (!ip) {
        ctx.body = {
            success: false,
            message: `Missing 'ip' parameter`
        };
        return;
    }

    const accessToken = config.get('ipinfoAccessToken');
    if (!accessToken) {
        ctx.body = {
            success: false,
            message: `IPINFO_ACCESS_TOKEN not configured`
        };
        return;
    }

    let retVal:any = {};

    const instance = axios.create({
        headers: { 'User-Agent': 'resolve.rs/1.0' },
        maxRedirects: 0,
        timeout: 5000,
        validateStatus: () => true,
    });

    try {
        const response = await instance.get(`https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${accessToken}`);
        retVal.success = response.status == 200;
        retVal.message = `Status from ipinfo.io: ${response.status}`;
        retVal.ip = ip;
        retVal.raw = response.data;
        retVal.country = response.data.country;
        if (response.data.loc) {
            const comma = response.data.loc.indexOf(',');
            if (comma > 0) {
                retVal.latitude = Number(response.data.loc.slice(0, comma-1));
                retVal.longitude = Number(response.data.loc.slice(comma+1));
            }
        }
        retVal.text = `${response.data.city}, ${response.data.region}, ${response.data.country}`;
        ctx.log.debug({ data: retVal, ip, provider: 'ipinfo' }, 'Geolocation result')
    } catch (err) {
        retVal.success = false;
        retVal.message = err.message;
        ctx.log.warn({ data: retVal, err, ip, provider: 'ipinfo' }, 'Geolocation error')
    }

    ctx.body = retVal;
}

export {
    ipinfoLookup,
}
