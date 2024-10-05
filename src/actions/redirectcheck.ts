import axios from 'axios';
import * as cheerio from 'cheerio';
//import * as url from 'URL';

//import { logger } from '../logger.js';
import * as util from "../util.js";

function extractTitle(html:string):string {

    try {
        const dom = cheerio.load(html);
        const titles = dom("head title");
        if (titles && titles.length > 0) {
            return titles.text() || '(empty title)';
        }
        return "(no title)";
    } catch (err) {
        return "(error ${err} trying to extract title)";
    }
}

async function redirectCheckGet(ctx:any) {
    await redirectCheckLow(ctx, util.getFirst(ctx.query.urls) || '');
}

async function redirectCheckPost(ctx:any) {
    await redirectCheckLow(ctx, ctx.request.body.urls);
}

async function redirectCheckLow(ctx:any, urlInput:string) {

    const urls = urlInput ? urlInput.trim().split(/,|\s/).map((s:string) => s.trim()).filter((x:string) => x.trim().length > 0) : null;

    //LATER: check that url is valid (maybe expand http & https if missing?)

    ctx.body = await ctx.render('http/redirect-check.hbs', {
        title: 'Redirect Check',
        rows: urls && urls.length > 5 ? urls.length : 5,
        urlInput,
        urls,
    });
}

async function redirectCheckApiGet(ctx:any) {
    const urlParam = ctx.query['url'];

    await redirectCheckApiLow(ctx, urlParam);
}

async function redirectCheckApiPost(ctx:any) {
    const urlParam = ctx.request.body.url;

    await redirectCheckApiLow(ctx, urlParam);
}

async function redirectCheckApiLow(ctx:any, urlParam:string) {
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

    const theUrl = util.parseUrl(urlParam);
    if (!theUrl) {
        util.handleJsonp(ctx, {
            success: false,
            message: `${urlParam} is not a valid URL`,
            url: urlParam
        });
        return;
    }

    //LATER: validate protocol
    //LATER: validate dns lookup

    const retVal = {
        success: true,
        message: ''
    }

    const instance = axios.create({
        headers: { 'User-Agent': 'resolve.rs/1.0' },
        maxRedirects: 0,
        timeout: 1000,
        validateStatus: function (status:number) {
            return status >= 200 && status < 400; // default
        }
    });

    try {
        const response = await instance.get(theUrl.toString());
        //LATER: if not redirect, get title from html
        if (response.status == 200) {
            retVal.message = `${response.status}: ${extractTitle(response.data)}`;
        } else {
            retVal.message = `${response.status}: ${response.headers["location"]}`;
        }
        ctx.log.debug({ data: retVal, urlParam }, 'redirect check');
    } catch (err) {
        ctx.log.error({ err, urlParam }, 'Unable to check redirect');
        retVal.success = false;
        retVal.message = err.message;
    }

    util.handleJsonp(ctx, retVal);
}

export {
    redirectCheckApiGet,
    redirectCheckApiPost,
    redirectCheckGet,
    redirectCheckPost
}
