import crypto from 'crypto';
import { promises as fsPromises } from 'fs';
import Handlebars from 'handlebars';
import Koa from 'koa';
import Router from 'koa-router';

import * as util from '../util';

type HashResult = {algorithm:string,value:string};

const cryptoRouter = new Router();

function getHashes(bytes:Buffer):HashResult[] {
    const hashes = crypto.getHashes();
    hashes.sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));
    const results:HashResult[] = [];
    for (const hashName of hashes) {
        const hash = crypto.createHash(hashName);

        hash.update(bytes);

        results.push({ algorithm: hashName, value: hash.digest('hex')});
    }
    return results;
}

function toHexSeparated(bytes:Buffer):string {
    const src = bytes.toString('hex');
    const dest:string[] = [];
    for (let x = 0; x < src.length; x += 2) {
        dest.push(src.slice(x, x+2));
    }
    return dest.join(' ');
}

function toHexPretty(bytes:Buffer):Handlebars.SafeString|string {

    if (bytes.length == 0) {
        return new Handlebars.SafeString("<i>(none)</i>");
    }
    if (bytes.length < 32) {
        return toHexSeparated(bytes);
    }
    return toHexSeparated(bytes.slice(0, 16)) + '...' + toHexSeparated(bytes.slice(bytes.length - 16));
}

cryptoRouter.get('/crypto/hash.html', async (ctx: any) => {

    let bytes:Buffer = Buffer.alloc(0);
    let theString:string = '';
    if (ctx.query) {
        if (ctx.query.string) {
            theString = ctx.query.string;
            bytes = Buffer.from(theString, 'utf8');
        } else if (ctx.query.bytes) {
            bytes = Buffer.from(ctx.query.bytes, 'hex');
        }
    }

    ctx.body = await ctx.render('crypto/hash.hbs', {
        hexString: toHexPretty(bytes),
        results: getHashes(bytes),
        size: bytes.length,
        string: theString,
        title: 'Calculate Hashes',
    });
});

cryptoRouter.post('/crypto/hash.html', async (ctx: any) => {

    const file = ctx.request.files.file;

    const bytes = await fsPromises.readFile(file.path);
    ctx.body = await ctx.render('crypto/hash.hbs', {
        fileName: file.name,
        hexString: toHexPretty(bytes),
        results: getHashes(bytes),
        size: bytes.length,
        title: 'Calculate Hashes',
    });
});

cryptoRouter.all('/crypto/hash.json', async (ctx:Koa.ExtendableContext) => {

    let bytes:Buffer = Buffer.alloc(0);
    let theString:string = '';
    if (ctx.query) {
        if (ctx.query.string) {
            theString = ctx.query.string;
            bytes = Buffer.from(theString, 'utf8');
        } else if (ctx.query.bytes) {
            bytes = Buffer.from(ctx.query.bytes, 'hex');
        }
    } else if (ctx.request.method == 'post') {
        if (ctx.request.files && ctx.request.files.file) {
            bytes = await fsPromises.readFile(ctx.request.files.file.path);
        }
    }

    const output:{[key: string]: string} = {};
    for (const hash of getHashes(bytes)) {
        output[hash.algorithm] = hash.value;
    }

    util.handleJsonp(ctx, {
        input: {
            size: bytes.length,
            hex: toHexPretty(bytes),
        },
        output,
        success: true
    });
});

cryptoRouter.get('/crypto/', async (ctx) => {
    ctx.redirect('/crypto/index.html');
});

cryptoRouter.get('/crypto/index.html', async (ctx) => {
    ctx.redirect('/tools.html#crypto');
});

function getUrls():string[] {
    return [
        "/crypto/hash.html",
    ];
}

export {
    cryptoRouter,
    getUrls
}
