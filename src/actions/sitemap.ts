import * as domainRouter from '../routers/domainRouter';
import * as httpRouter from '../routers/httpRouter';
import * as ipRouter from '../routers/ipRouter';
import * as resolvers from '../data/resolverData';

async function sitemap(ctx:any) {

    let urls:string[] = [];

    urls.push(...domainRouter.getUrls());
    urls.push(...httpRouter.getUrls());
    urls.push(...ipRouter.getUrls());

    urls.push("/");
    urls.push("/api.html");
    urls.push("/contact.html");
    urls.push("/tools.html");
    urls.push("/dns-lookup.html");
    urls.push("/reverse-dns-lookup.html");

    urls.push("/resolvers/index.html");
    for (const resolver of resolvers.getAll()) {
      urls.push(`/resolvers/${resolver.key}/index.html`);
    }

    urls.sort();

    ctx.body = await ctx.render('sitemap.hbs', { urls });
    ctx.type = "text/xml;charset=utf-8";
}

export {
    sitemap
}