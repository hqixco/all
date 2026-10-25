import fs from 'node:fs';
import tls from 'node:tls';

const file='public/max-root-ca.crt';
const existing=fs.readFileSync(file,'utf8').match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g)||[];
const certificates=[...new Set([...existing,...tls.rootCertificates].map(cert=>cert.trim()))];
fs.writeFileSync(file,certificates.join('\n')+'\n');
console.log('MAX certificate bundle updated with standard trusted roots; TLS verification remains enabled.');
