import * as crypto from 'crypto';
import Handlebars from 'handlebars';
import * as psl from 'psl';
import * as http from 'http';
import * as https from 'https';
import * as tls from 'tls';

import { logger } from '../logger';
import * as streamer from '../streamer';

async function tlsCertCheckGet(ctx:any) {
  ctx.body = await ctx.render('ip/tls-cert-check.hbs', {
    hostname: ctx.query.hostname,
    title: 'TLS Certificate Check'
  });
}

async function tlsCertCheckPost(ctx:any) {

  let hostname:string = ctx.request.body.hostname;
  let port = 443;
  if (!hostname) {
    ctx.flash('error', 'You must enter a hostname to check!');
    ctx.redirect('tls-cert-check.html');
    return;
  }

  if (/^http(s)?:\/\//i.test(hostname)) {
    const url = new URL(hostname);
    hostname = url.hostname;
    if (url.port) {
        port = Number(url.port);
    }
  } else {
      const colon = hostname.indexOf(':');
      if (colon != -1) {
        port = Number(hostname.substring(colon+1));
        hostname = hostname.substring(0, colon);
      }

  }

  if (!psl.isValid(hostname)) {
    ctx.flash('error', `${Handlebars.escapeExpression(hostname)} is not a valid hostname!`);
    ctx.redirect(`tls-cert-check.html?hostname=${encodeURIComponent(hostname)}`);
    return;
  }

  streamer.streamResponse(ctx, `TLS Certificate check for ${hostname}`, async (stream) => {

    let expires:string|null = null;

    stream.write(`<p>Checking <code>${hostname}</code> on port <code>${port}</code>...</p>`);

    const options = {
        agent: false,
        checkServerIdentity: function(host:string, cert:any) {
            const tlsErr = tls.checkServerIdentity(host, cert);
            if (tlsErr) {
                stream.write(`<div class="alert alert-danger">`);
                stream.write(`Invalid certificate: ${tlsErr.message}`);
                stream.write(`</div>`);
            }

            do {
                if (expires == null && cert.valid_to) {
                    expires = cert.valid_to;
                }
                const sha256 = crypto.createHash('sha256').update(cert.raw).digest().toString('hex');
                stream.write("<details>");
                stream.write(`<summary>Certificate for ${cert.subject.CN}</summary>`)
                stream.write(`<table class="table table-striped"><tbody>`)
                stream.write(`<tr><td>Subject</td><td><pre>${JSON.stringify(cert.subject, null, 2)}</pre></td></tr>`);
                stream.write(`<tr><td>Issuer</td><td><pre>${JSON.stringify(cert.issuer, null, 2)}</pre></td></tr>`);
                stream.write(`<tr><td>Valid from</td><td>${cert.valid_from}</td></tr>`);
                stream.write(`<tr><td>Valid to</td><td>${cert.valid_to}</td></tr>`);
                stream.write(`<tr><td>Fingerprint</td><td>${cert.fingerprint256}</td></tr>`);
                stream.write(`<tr><td>Serial&nbsp;number</td><td>${cert.serialNumber}</td></tr>`);
                stream.write(`<tr><td>SHA-256</td><td>${sha256}</td></tr>`);
                stream.write(`<tr><td>Public key</td><td><a download="publickey.der" href="data:jpg/image;base64,${cert.raw.toString('base64')}">Download</a> (DER format)</td></tr>`);
                stream.write(`</tbody></table>`);
                stream.write("</details>");
                logger.info({ subject: cert.subject, issuer: cert.issuerCertificate ? cert.issuerCertificate.subject : '(none)'}, "cert");
                if (cert == cert.issuerCertificate) {
                    break;
                }
                cert = cert.issuerCertificate;
            } while (cert)

            return undefined;
        },
        ciphers: 'ALL',
        hostname,
        port,
        rejectUnauthorized: false,
        requestOCSP: true,
        servername: hostname,
    };

    const p = new Promise<any>( (resolve, reject) => {

        const  tlsSocket = tls.connect(port, hostname, options, () => {

            if (!tlsSocket.authorized) {
                stream.write(`<div class="alert alert-danger">`);
                stream.write(`Invalid certificate: ${tlsSocket.authorizationError}`);
                stream.write(`</div>`);
            }

            stream.write(`<p class="mt-3">Remote address: ${tlsSocket.remoteAddress}</p>`);

            const cipher = tlsSocket.getCipher();
            stream.write(`<p>Cipher: ${cipher.name} ${cipher.version}</p>`);

            stream.write(`<div class="alert alert-info">`);
            stream.write(`Complete`);
            stream.write(`</div>`);

            tlsSocket.end();

            stream.write(`<p><a class="btn btn-primary" href="tls-cert-check.html?hostname=${encodeURIComponent(hostname)}${ port == 443 ? "" : ":" + port}">Continue</a>`);
        });

        tlsSocket.on('connect', () => {
            stream.write(`<p>Connected</p>`);
        });
        tlsSocket.on('end', () => {
            stream.write(`<p>End</p>`);
            resolve();
        });
        tlsSocket.on('error', (err) => {
            stream.write(`<div class="alert alert-danger">${err.message}</div>`);
            //alert, continue
            tlsSocket.end();
            resolve();
        });
        tlsSocket.on('OCSPResponse', () => {
            stream.write(`<p>OCSPResponse</p>`);
        });
        tlsSocket.on('keylog', () => {
            stream.write(`<p>keylog</p>`);
        });
        tlsSocket.on('secureConnect', () => {
            stream.write(`<p>secureConnect</p>`);
        });
        tlsSocket.on('lookup', (err, family, address, host) => {
            stream.write(`<p>Lookup for <code>${host}</code> returned <code>${address}</code> (TCPv${family})</p>`);
        });
    });

    return p;
  });
}

async function httpsCertCheckGet(ctx:any) {
    ctx.body = await ctx.render('http/cert-check.hbs', {
      hostname: ctx.query.hostname,
      title: 'HTTPS Certificate Check'
    });
  }

async function httpsCertCheckPost(ctx:any) {

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

    streamer.streamResponse(ctx, `HTTPS Certificate check for ${hostname}`, async (stream) => {

      let expires:string|null = null;

      const options = {
          agent: false,
          checkServerIdentity: function(host:string, cert:any) {
              do {
                  if (expires == null && cert.valid_to) {
                      expires = cert.valid_to;
                  }
                  const sha256 = crypto.createHash('sha256').update(cert.raw).digest().toString('hex');
                  stream.write("<details>");
                  stream.write(`<summary>Certificate for ${cert.subject.CN}</summary>`)
                  stream.write(`<table class="table table-striped"><tbody>`)
                  stream.write(`<tr><td>Subject</td><td><pre>${JSON.stringify(cert.subject, null, 2)}</pre></td></tr>`);
                  stream.write(`<tr><td>Issuer</td><td><pre>${JSON.stringify(cert.issuer, null, 2)}</pre></td></tr>`);
                  stream.write(`<tr><td>Valid from</td><td>${cert.valid_from}</td></tr>`);
                  stream.write(`<tr><td>Valid to</td><td>${cert.valid_to}</td></tr>`);
                  stream.write(`<tr><td>Fingerprint</td><td>${cert.fingerprint256}</td></tr>`);
                  stream.write(`<tr><td>Serial&nbsp;number</td><td>${cert.serialNumber}</td></tr>`);
                  stream.write(`<tr><td>SHA-256</td><td>${sha256}</td></tr>`);
                  stream.write(`<tr><td>Public key</td><td><a download="publickey.der" href="data:jpg/image;base64,${cert.raw.toString('base64')}">Download</a> (DER format)</td></tr>`);
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
    httpsCertCheckGet,
    httpsCertCheckPost,
    httpsRequest,
    tlsCertCheckGet,
    tlsCertCheckPost
}
