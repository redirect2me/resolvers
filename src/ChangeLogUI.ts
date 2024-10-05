import Handlebars from 'handlebars';
import Router from '@koa/router';
import { DateTime } from 'luxon';

import { ChangeLog } from "./changelog.js";

class ChangeLogUI {
    changelogRouter: Router;

    constructor(
        private changeLog: ChangeLog,
        private home: string,
        private mount: string,
        private title: string,
        private aplink: string,
    ) {
        this.init();
    }

    init() {
        this.changelogRouter = new Router();

        this.changelogRouter.get(`${this.mount}/`, async (ctx: any) => {
            ctx.redirect(`${this.mount}/index.html`);
        });

        this.changelogRouter.get(`${this.mount}/index.html`, async (ctx: any) => {

            ctx.body = await ctx.render('_changelog/index.hbs', {
                aplink: this.aplink,
                count: this.changeLog.getKeys().length,
                data: this.changeLog.getAll(),
                h1: new Handlebars.SafeString(`<a href="../index.html">${Handlebars.escapeExpression(this.title)}</a> Change Log`),
                rssUrl: `https://resolve.rs${this.mount}/rss.xml`,
                title: `${this.title} Change Log`,
            });
        });

        this.changelogRouter.get(`${this.mount}/:date.html`, async (ctx: any) => {
            const date = ctx.params.date;
            const data = this.changeLog.get(date);

            if (data) {
                ctx.body = await ctx.render('_changelog/_index.hbs', {
                    data,
                    date,
                    h1: new Handlebars.SafeString(`<a href="../index.html">${Handlebars.escapeExpression(this.title)}</a> Changes on ${date}`),
                    next: this.changeLog.getNext(date),
                    previous: this.changeLog.getPrevious(date),
                    title: `${this.title} Changes on ${date}`,
                });
            } else {
                ctx.status = 404;
            }
        });

        this.changelogRouter.get(`${this.mount}/rss.xml`, async (ctx: any) => {

            const startDate = this.changeLog.getFirst().date;
            const pubDate = DateTime.fromISO(startDate, { zone: 'utc' }).toRFC2822();

            ctx.body = await ctx.render('_changelog/rss.hbs', {
                data: Object.values(this.changeLog.getAll()).slice(0, 20),
                description: `Monitor changes to the ${this.title} via RSS`,
                home: this.home,
                name: `${this.title} Change Log`,
                path: this.mount,
                pubDate,
            });
            ctx.type = 'text/xml';
        });

        this.changelogRouter.get(`${this.mount}/:date.txt`, async (ctx: any) => {
            const date = ctx.params.date;
            const data = this.changeLog.get(date);

            if (data) {
                ctx.body = data.raw;
            } else {
                ctx.status = 404;
            }
        });

        this.changelogRouter.get(`${this.mount}/:date.json`, async (ctx: any) => {
            const date = ctx.params.date;
            const data = this.changeLog.get(date);

            if (data) {
                ctx.body = JSON.stringify(data, null, 2); //LATER: util.handleJsonp(ctx, data);
            } else {
                ctx.status = 404;
            }
        });
    }

    getUrls(): string[] {
        return [
            `${this.mount}/index.html`,
        ];
    }
}

export { ChangeLogUI }
