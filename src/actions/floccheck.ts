import axios from 'axios';
//import * as url from 'URL';

import * as util from "../util.js";


type flocReturnValue = {
    success: boolean,
    message: string,
    urlOriginal?: string,
    urlParsed?: string,
    urlFinal?: string,
    raw?: any,
}

async function flocCheckGet(ctx:any) {
    ctx.log.info('get');
    await flocCheckPageLow(ctx, ctx.query.urls);
}

async function flocCheckPost(ctx:any) {
    await flocCheckPageLow(ctx, ctx.request.body.urls);
}

async function flocCheckPageLow(ctx:any, urlInput:string|undefined) {
    const urls = urlInput ? urlInput.split(/,|\n/).map((s:string) => s.trim()) : [];

    ctx.body = await ctx.render('http/floc-check.hbs', {
        title: 'FLoC Check',
        rows: urls && urls.length > 5 ? urls.length : 5,
        urlInput: urls && urls.length > 1 ? urls.join('\n') : urlInput,
        urls: urls.filter((x:string) => x.charAt(0) != '#'),
    });
}
async function flocCheckApiGet(ctx:any) {
    const urlParam = ctx.query['url'];

    await flocCheckApiLow(ctx, urlParam);
}

async function flocCheckApiPost(ctx:any) {
    const urlParam = ctx.request.body.url;

    await flocCheckApiLow(ctx, urlParam);
}

async function flocCheckApiLow(ctx:any, urlParam:string) {
    if (!util.validateCaller(ctx)) {
        return;
    }

    if (!urlParam) {
        util.handleJsonp(ctx, {
            success: false,
            message: `Missing 'url' parameter`
        });
        return;
    }

    const theUrl = util.parseUrl(urlParam.indexOf('/') == -1 ? `http:${urlParam}/` : urlParam);
    if (!theUrl) {
        util.handleJsonp(ctx, {
            success: false,
            message: `${urlParam} is not a valid URL`,
            urlOriginal: urlParam
        });
        return;
    }

    //LATER: validate protocol
    //LATER: validate dns lookup

    const retVal:flocReturnValue = {
        success: true,
        message: '',
        urlOriginal: urlParam,
        urlParsed: theUrl.toString(),
    };

    const instance = axios.create({
        headers: { 'User-Agent': 'resolve.rs/1.0 FLoC check' },
        timeout: 2500,
        validateStatus: function (status:number) {
            return status >= 200 && status < 400; // default
        }
    });

    try {
        const response = await instance.get(theUrl.toString());
        retVal.urlFinal = response.request.res.responseUrl;
        const flocHeader = response.headers["permissions-policy"];
        if (!flocHeader) {
            retVal.message = '(not set)';
        } else if (flocHeader == 'interest-cohort=()') {
            retVal.message = 'Opt-out';
        } else {
            retVal.message = flocHeader;
        }
        retVal.raw = {
            status: response.status,
            headers: response.headers,
        }
        ctx.log.debug({ data: retVal, urlParam }, 'floc check');
    } catch (err) {
        ctx.log.error({ err, urlParam }, 'Unable to check FLoC');
        retVal.success = false;
        retVal.message = err.message;
    }

    util.handleJsonp(ctx, retVal);
}

export {
    flocCheckApiGet,
    flocCheckApiPost,
    flocCheckGet,
    flocCheckPost
}
