import axios, { AxiosResponse } from "axios";
//import { promises as fsPromises } from 'fs';
import handlebars from "handlebars";
import Router from "@koa/router";
//import * as path from 'path';

import * as util from "../util.js";
import config from "../config.js";
import { logger } from "../logger.js";

const infoRouter = new Router();

infoRouter.get("/info/", async (ctx) => {
    ctx.redirect("/info/index.html");
});

infoRouter.get("/info/index.html", async (ctx) => {
    ctx.redirect("/tools.html#info");
});

type ActivityPubData = {
    success: boolean;
    message: string;
    url: string;
    error?: string;
    isWebfinger?: boolean;
    account?: string;
    webfingerUrl?: string;
};

async function activityPubData(q: string): Promise<ActivityPubData> {
    if (!q) {
        return {
            success: false,
            message: "No URL provided",
            url: "",
        };
    }
    let theUrl: URL | undefined;
    try {
        theUrl = new URL(q);
    } catch (err) {
        return {
            success: false,
            message: "Invalid URL: unable to parse",
            error: err.message,
            url: q,
        };
    }

    if (!util.hasValidPublicSuffix(theUrl.hostname)) {
        return {
            success: false,
            message: "Invalid URL: not a public suffix",
            url: theUrl.href,
        };
    }

    if (
        theUrl.pathname.length < 3 ||
        (theUrl.pathname.charAt(2) != "@") == false
    ) {
        return {
            success: false,
            message: "Invalid URL: not an account URL",
            url: theUrl.href,
        };
    }

    const account = `${theUrl.pathname.slice(2)}@${theUrl.hostname}`;
    const webfingerUrl = `https://${encodeURIComponent(
        theUrl.hostname
    )}/.well-known/webfinger?resource=acct:${encodeURIComponent(account)}`;

    let resp: Response | undefined;
    try {
        resp = await fetch(webfingerUrl, {
            method: "GET",
            headers: {
                Accept: "application/jrd+json",
                "User-Agent": `resolve.rs/1.0 ActivityPub Detector`,
            },
        });
    } catch (err) {
        return {
            success: false,
            message: "Webfinger fetch failed",
            url: theUrl.href,
            error: err.message,
            account,
            webfingerUrl,
        };
    }
    //https://mastodon.social/.well-known/webfinger?resource=acct:%40gargron%40mastodon.social
    //https://mastodon.social/.well-known/webfinger?resource=acct:gargron@mastodon.social
    if (resp.status !== 200) {
        return {
            success: false,
            message: `Webfinger lookup error`,
            url: theUrl.href,
            error: `HTTP status code ${resp.status}`,
            account,
            webfingerUrl,
        };
    }

    let json: any;
    try {
        json = await resp.json();
    } catch (err) {
        return {
            success: false,
            message: "Webfinger response parse error",
            url: theUrl.href,
            error: err.message,
            account,
            webfingerUrl,
        };
    }

    logger.debug({ json, account, webfingerUrl }, "Webfinger response");

    return {
        success: true,
        message: "ActivityPub detected via Webfinger",
        url: theUrl.href,
        isWebfinger: true,
        account,
        webfingerUrl,
    };
}

infoRouter.get("/info/activitypub-detector.html", async (ctx) => {

    const q = util.getFirst(ctx.request.query.url || "");
    ctx.body = await ctx.render("info/activitypub-detector.hbs", {
        title: "ActivityPub Detector",
        results: q ? await activityPubData(q) : null,
        url: q,
    });
});

infoRouter.get("/info/activitypub-detector.json", async (ctx) => {
    const q = util.getFirst(ctx.request.query.url || "");

    util.handleJsonp(ctx, await activityPubData(q));
});

infoRouter.get("/info/companyenrich", async (ctx: any) => {
    const domain = ctx.request.query.domain;
    if (!domain || !config.get("companyenrichAccessKey")) {
        ctx.status = 400;
        ctx.body = {
            success: false,
            message: `Missing 'domain' parameter or COMPANYENRICH_ACCESS_KEY not configured`,
        };
        return;
    }
    const instance = axios.create({
        maxRedirects: 0,
        timeout: 5000,
        validateStatus: () => true,
    });

    try {
        const response: AxiosResponse<any> = await instance.get(
            `https://api.companyenrich.com/companies/enrich?domain=${encodeURIComponent(
                domain
            )}`,
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${config.get(
                        "companyenrichAccessKey"
                    )}`,
                },
            }
        );
        logger.trace(
            { data: response.data, domain, provider: "companyenrich" },
            "Logo fetch result"
        );
        if (response.status == 200) {
            if (!response.data.logo_url) {
                ctx.body = {
                    success: false,
                    message: "CompanyEnrich does not have the logo",
                };
                return;
            }
            ctx.redirect(response.data.logo_url);
            return;
        }
        logger.warn(
            { domain, provider: "companyenrich", raw: response.data },
            "Logo fetch error"
        );
        ctx.body = {
            success: false,
            message: `Status from api.companyenrich.com: ${response.status}`,
            raw: response.data,
        };
        return;
    } catch (err) {
        logger.warn(
            { err, domain, provider: "companyenrich" },
            "Logo fetch error"
        );
        ctx.body = {
            success: false,
            message: err.message,
        };
        return;
    }
});

infoRouter.get("/info/glossary.html", async (ctx: any) => {
    ctx.body = await ctx.render("info/glossary.hbs", {
        title: "Glossary",
    });
});

infoRouter.get("/info/steps.html", async (ctx: any) => {
    ctx.body = await ctx.render("info/steps.hbs", {
        title: "Steps to get a web page",
    });
});

infoRouter.get("/info/random-logo.html", async (ctx: any) => {
    const resp = await fetch("https://siterank.redirect2.me/api/random.json");
    const json = await resp.json();
    const domain = json.domain;
    ctx.redirect(
        `/info/logo-api-comparison.html?domain=${encodeURIComponent(domain)}`
    );
});

type LogoResult = {
    provider: string;
    providerUrl: string;
    logoUrl: string;
};

infoRouter.get("/info/logo-api-comparison.html", async (ctx: any) => {
    let domain = ctx.request.query.domain;
    let loadLogos = true;
    if (!domain) {
        ctx.flash(
            "info",
            new handlebars.SafeString(
                `This is a comparison of <a href="https://andrew.marcuse.info/blog/2024/2024-12-11-logo-apis.html">Logo APIs</a> that have free/public tiers.`
            )
        );
        loadLogos = false;
    }

    if (loadLogos && !util.hasValidPublicSuffix(domain)) {
        try {
            const url = new URL(domain);
            domain = url.hostname;
        } catch (err) {
            ctx.flash(
                "error",
                `Unable to extract a domain from "${handlebars.escapeExpression(
                    domain
                )}"!`
            );
            loadLogos = false;
        }
        if (!util.hasValidPublicSuffix(domain)) {
            ctx.flash(
                "error",
                `${handlebars.escapeExpression(domain)} is not a valid domain!`
            );
            loadLogos = false;
        }
    }

    const results: LogoResult[] = [];
    if (loadLogos) {
        if (config.get("brandfetchApiKey")) {
            results.push({
                provider: "Brandfetch",
                providerUrl: "https://brandfetch.com/developers",
                logoUrl: `https://cdn.brandfetch.io/${encodeURIComponent(
                    domain
                )}/w/256/h/256?c=${config.get("brandfetchApiKey")}`,
            });
        }
        results.push({
            provider: "Clearbit",
            providerUrl: "https://clearbit.com/",
            logoUrl: `https://logo.clearbit.com/${encodeURIComponent(domain)}`,
        });
        if (config.get("companyenrichAccessKey")) {
            results.push({
                provider: "CompanyEnrich",
                providerUrl: "https://companyenrich.com/logo-api",
                logoUrl: `/info/companyenrich?domain=${encodeURIComponent(
                    domain
                )}`,
            });
        }
        results.push({
            provider: "CUFinder",
            providerUrl: "https://cufinder.io/enrichment-engine/logo-api",
            logoUrl: `https://api.cufinder.io/logo/${encodeURIComponent(
                domain
            )}`,
        });
        if (config.get("logodevToken")) {
            results.push({
                provider: "logo.dev",
                providerUrl: "https://logo.dev",
                logoUrl: `https://img.logo.dev/${encodeURIComponent(
                    domain
                )}?token=${encodeURIComponent(
                    config.get("logodevToken") || ""
                )}`,
            });
        }
        results.push({
            provider: "Lucky Logo",
            providerUrl: `https://lucky.logosear.ch/all-logos.html?url=${encodeURIComponent(
                domain
            )}`,
            logoUrl: `https://lucky.logosear.ch/logo?url=${encodeURIComponent(
                domain
            )}`,
        });
        results.push({
            provider: "Uplead",
            providerUrl: "https://www.uplead.com/free-company-logo-api/",
            logoUrl: `https://logo.uplead.com/${encodeURIComponent(domain)}`,
        });
    }

    ctx.body = await ctx.render("info/logo-api-comparison.hbs", {
        title: `Logo API comparision`,
        domain,
        encodedCurrentUrl: encodeURIComponent(ctx.request.href),
        results,
    });
});

function getUrls(): string[] {
    return [
        "/info/glossary.html",
        "/info/steps.html",
        "/info/logo-api-comparison.html",
    ];
}

export { getUrls, infoRouter };
