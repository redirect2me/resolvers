import Handlebars from 'handlebars';
import * as psl from 'psl';
import * as http from 'http';
import * as https from 'https';
import * as tls from 'tls';

import { logger } from '../logger';
import * as streamer from '../streamer';

async function certCheckGet(ctx:any) {
  ctx.body = await ctx.render('http/cert-check.hbs', {
    hostname: ctx.query.hostname,
    title: 'Certificate Check'
  });
}

async function certCheckPost(ctx:any) {

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

    let expires:string|null = null;

    const options = {
        agent: false,
        checkServerIdentity: function(host:string, cert:any) {
            do {
                if (expires == null && cert.valid_to) {
                    expires = cert.valid_to;
                }
                stream.write("<details>");
                stream.write(`<summary>Certificate for ${cert.subject.CN}</summary>`)
                stream.write(`<table class="table table-striped"><tbody>`)
                stream.write(`<tr><td>Subject</td><td><pre>${JSON.stringify(cert.subject, null, 2)}</pre></td></tr>`);
                stream.write(`<tr><td>Issuer</td><td><pre>${JSON.stringify(cert.issuer, null, 2)}</pre></td></tr>`);
                stream.write(`<tr><td>Valid from</td><td>${cert.valid_from}</td></tr>`);
                stream.write(`<tr><td>Valid to</td><td>${cert.valid_to}</td></tr>`);
                stream.write(`<tr><td>Fingerprint</td><td>${cert.fingerprint256}</td></tr>`);
                stream.write(`<tr><td>Serial&nbsp;number</td><td>${cert.serialNumber}</td></tr>`);
                stream.write(`</tbody></table>`);
                stream.write("</details>");
            logger.info({ subject: cert.subject, issuer: cert.issuerCertificate ? cert.issuerCertificate.subject : '(none)'}, "cert");
            if (cert == cert.issuerCertificate) {
                break;
            }
            cert = cert.issuerCertificate;
            } while (cert)
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


    const tlsSocket = res.socket as tls.TLSSocket;

    stream.write("<details>");
    stream.write(`<summary>HTTP Response</summary>`);
    stream.write(`<table class="table table-striped"><tbody>`)
    stream.write(`<tr><td>Authorized</td><td>${tlsSocket.authorized}</td></tr>`);
    stream.write(`<tr><td>Remote IP</td><td>${res.socket.remoteAddress}</td></tr>`);
    stream.write(`<tr><td>HTTP version</td><td>${res.httpVersion}</td></tr>`);
    stream.write(`<tr><td>Server</td><td>${res.headers.server}</td></tr>`);
    stream.write(`<tr><td>Protocol</td><td>${tlsSocket.getProtocol()}</td></tr>`);
    stream.write(`<tr><td>Cipher</td><td>${tlsSocket.getCipher().name}}</td></tr>`);
    stream.write(`</tbody></table>`);
    stream.write("</details>");

    stream.write(`<p>Expires: ${expires}</p>`);

    stream.write(`<div class="alert alert-info">`);
    stream.write(`Complete`);
    stream.write(`</div>`);

    stream.write(`<p><a class="btn btn-primary" href="cert-check.html?hostname=${encodeURIComponent(hostname)}">Continue</a>`);
  });
}

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
    certCheckGet,
    certCheckPost
}