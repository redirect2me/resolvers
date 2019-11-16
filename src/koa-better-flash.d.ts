declare module 'koa-better-flash' {

    import { Middleware } from 'koa';

    export = flash;

    function flash(): Middleware;

    interface Flash { (type?: string, msg?: string): any; }

    module 'koa' {
        interface Context {
            flash:Flash;
        }
    }

}
