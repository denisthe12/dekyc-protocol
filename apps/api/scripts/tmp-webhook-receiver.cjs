const http = require('http');

const server = http.createServer((req, res) => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    console.log('\n--- WEBHOOK RECEIVED ---');
    console.log('method:', req.method);
    console.log('url:', req.url);
    console.log('headers:', req.headers);
    console.log('body:', body);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  });
});

server.listen(3310, () => {
  console.log('Webhook receiver listening on http://localhost:3310/webhook');
});