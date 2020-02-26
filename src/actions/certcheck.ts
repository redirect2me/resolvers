//import { promises as dnsPromises } from 'dns';
import Handlebars from 'handlebars';
import Router from 'koa-router';
import * as psl from 'psl';
import * as http from 'http';
import * as https from 'https';

import { logger } from '../logger';
import * as streamer from '../streamer';

const certCheckRouter = new Router();

certCheckRouter.get('/http/cert-check.html', async (ctx:any) => {
  ctx.body = await ctx.render('http/cert-check.hbs', {
    hostname: ctx.query.hostname,
    title: 'Certificate Check'
  });
});


certCheckRouter.post('/http/cert-check.html', async (ctx:any) => {

  const hostname = ctx.request.body.hostname;
  if (!hostname) {
    ctx.flash('error', 'You must enter a hostname to check!');
    ctx.redirect('cert-check.html');
    return;
  }

  if (!psl.isValid(hostname)) {
    ctx.flash('error', `${Handlebars.escapeExpression(hostname)} is not a valid hostname!`);
    ctx.redirect(`cert-check.html?hostname=${encodeURIComponent(hostname)}`);
    return;
  }

  streamer.streamResponse(ctx, `Certificate check for ${hostname}`, async (stream) => {

    const options = {
        agent: false,
        checkServerIdentity: function(host:string, cert:any) {
            do {
                stream.write(`<h2>Certificate for ${cert.subject.CN}</h2>`)
                stream.write(`<table class="table table-striped"><tbody>`)
            stream.write(`<tr><td>Subject</td><td><pre>${JSON.stringify(cert.subject, null, 2)}</pre></td></tr>`);
            stream.write(`<tr><td>Issuer</td><td><pre>${JSON.stringify(cert.issuer, null, 2)}</pre></td></tr>`);
            stream.write(`<tr><td>Valid from</td><td>${cert.valid_from}</td></tr>`);
            stream.write(`<tr><td>Valid to</td><td>${cert.valid_to}</td></tr>`);
            stream.write(`<tr><td>Fingerprint</td><td>${cert.fingerprint256}</td></tr>`);
            stream.write(`<tr><td>Serial number</td><td>${cert.serialNumber}</td></tr>`);
            stream.write(`</tbody></table>`);
            logger.info({ cert }, "cert");
            cert = cert.issuerCertificate;
            } while (cert && cert != cert.issuerCertificate)
        },
        ciphers: 'ALL',
        hostname,
        method: 'GET',
        port: 443,
        path: '/',
        rejectUnauthorized: false,
    };

    const { req, res } = await httpsRequest(options);

    logger.trace( { req, res }, "cert check response");

    stream.write(`<h2>HTTP Response</h2>`);

    //stream.write(`<p>Remote IP=${req.remoteAddress}</p>`)
    stream.write(`<p>HTTP version=${res.httpVersion}</p>`);
    stream.write(`<p>Server=${res.headers.server}</p>`)
    //stream.write(res.)

    stream.write(`<div class="alert alert-info">`);
    stream.write(`Complete`);
    stream.write(`</div>`);

    stream.write(`<p><a class="btn btn-primary" href="cert-check.html?hostname=${encodeURIComponent(hostname)}">Continue</a>`);
  });
});

function httpsRequest(options:any): Promise<{req:http.ClientRequest, res:http.IncomingMessage}> {
    const p:Promise<any> = new Promise( (resolve, reject) => {
        const req = https.request(options, res => {
            resolve( { req, res });
        })
        req.on('error' , (e) => {
            reject(e);
        });
        req.end();
    });

    return p;
}

export {
    certCheckRouter
}