import http from 'http';

http.get('http://0.0.0.0:3000', (res) => {
  console.log('Status Code:', res.statusCode);
  res.on('data', (chunk) => {
    console.log('BODY:', chunk.toString());
  });
}).on('error', (e) => {
  console.error('Got error:', e.message);
});
