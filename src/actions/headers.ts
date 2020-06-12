//import Handlebars from 'handlebars';
import axios from 'axios';

import * as util from '../util';


async function headersApi(ctx: any, targetUrl: string) {

    if (!util.validateCaller(ctx)) {
        return;
    }

    if (!targetUrl) {
        util.handleJsonp(ctx, { success: false, message: `Missing 'url' parameter`});
        return;
    }

    const theUrl = util.parseUrl(targetUrl);

    if (!theUrl) {
        util.handleJsonp(ctx, { success: false, message: `${targetUrl} is not a valid URL` });
        return;
    }

    let result:any;

    try {
        result = await getHeaders(ctx, theUrl);
    } catch (err) {
        util.handleJsonp(ctx, {
            success: false,
            err,
            input: targetUrl,
            message: `${err.message} when checking ${targetUrl}`
        });
        return;
    }

    util.handleJsonp(ctx, {
        input: targetUrl,
        output: result,
        success: true
    });
}

async function headersApiGet(ctx: any) {
    await headersApi(ctx, ctx.query.url);
}

async function headersApiPost(ctx: any) {
    await headersApi(ctx, ctx.request.body.url);
}

async function getHeaders(ctx:any, theUrl:URL): Promise<any> {
    const instance = axios.create({
        headers: {
            'Referer': ctx.request.url,
            'User-Agent': 'resolve.rs/1.0'
        },
        maxRedirects: 0,
        timeout: 5000,
        validateStatus: function (status:number) {
            return status >= 200 && status < 400; // default
        }
    });

    const response = await instance.get(theUrl.toString());
    return response.headers;
}

async function headersGet(ctx: any) {

    const urlParam = ctx.query.url;

    let result:any;

    if (urlParam) {

        const theUrl = util.parseUrl(urlParam);
        if (!theUrl) {
            ctx.flash('error', `${urlParam} is not a valid URL`)
        }
        else {
            try {
                result = await getHeaders(ctx, theUrl);
            } catch (err) {
                ctx.log.error({ err, urlParam }, 'Unable to check redirect');
                ctx.flash('error', `${err.message} when checking ${urlParam}`);
            }
        }
    }

    ctx.body = await ctx.render('http/headers.hbs', {
        result,
        title: 'HTTP Response Headers',
        url: urlParam
    });
}

export {
    headersGet,
    headersApiGet,
    headersApiPost
}
