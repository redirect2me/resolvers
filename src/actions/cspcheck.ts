import * as util from "../util.js";
import axios from "axios";

type cspReturnValue = {
    success: boolean;
    message: string;
    urlOriginal?: string;
    urlParsed?: string;
    urlFinal?: string;
    cspHeader?: string;
    reportOnly: boolean;
    raw?: any;
};

async function BulkCspCheckGet(ctx: any) {
    const urlsInput = ctx.request.query["urls"] || "";
    ctx.body = await ctx.render("http/bulk-csp-check.hbs", {
        urlsInput,
        title: "Bulk Content-Security-Policy Check",
    });
}

async function BulkCspCheckPost(ctx: any) {
    const urlsInput = ctx.request.body.urls || "";
    const urls = urlsInput
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);
    ctx.body = await ctx.render("http/bulk-csp-check.hbs", {
        urls,
        urlsInput,
        rows: Math.min(12, urls.length + 2),
        title: "Bulk Content-Security-Policy Check",
    });
}

async function CspCheckApi(ctx: any) {
    if (!util.validateCaller(ctx)) {
        return;
    }

    const urlParam = ctx.query.url;

    if (!urlParam) {
        util.handleJsonp(ctx, {
            success: false,
            message: `Missing 'url' parameter`
        });
        return;
    }

    const theUrl = util.parseUrl(urlParam.indexOf('/') == -1 ? `https:${urlParam}/` : urlParam);
    if (!theUrl) {
        util.handleJsonp(ctx, {
            success: false,
            message: `${urlParam} is not a valid URL`,
            urlOriginal: urlParam
        });
        return;
    }

    const retVal: cspReturnValue = {
        success: true,
        message: "",
        urlOriginal: urlParam,
        urlParsed: theUrl.toString(),
        reportOnly: false,
    };

    const instance = axios.create({
        headers: { "User-Agent": "resolve.rs/1.0 Content-Security-Policy check" },
        timeout: 2500,
        validateStatus: function (status: number) {
            return status >= 200 && status < 400; // default
        },
    });

    try {
        const response = await instance.get(theUrl.toString());
        retVal.urlFinal = response.request.res.responseUrl;
        retVal.cspHeader = response.headers["content-security-policy"];
        if (!retVal.cspHeader) {
            retVal.cspHeader =
                response.headers["content-security-policy-report-only"];
            if (retVal.cspHeader) {
                retVal.reportOnly = true;
            }
        }
        retVal.raw = {
            status: response.status,
            headers: response.headers,
        };
        ctx.log.debug({ data: retVal, urlParam }, "csp check");
    } catch (err) {
        ctx.log.error({ err, urlParam }, "Unable to check CSP");
        retVal.success = false;
        retVal.message = err.message;
    }

    util.handleJsonp(ctx, retVal);
}


export {
    BulkCspCheckGet,
    BulkCspCheckPost,
    CspCheckApi,
};
