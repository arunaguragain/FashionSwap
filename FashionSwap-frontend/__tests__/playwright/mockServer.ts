import http from 'http';

type Handler = (req: http.IncomingMessage, body: string) => { status?: number; body?: any } | null;

export function createMockServer(handler: Handler, port = 5050) {
  let server: http.Server | null = null;
  const _requests: Array<{ method: string; url?: string; body?: string }> = [];

  const start = () =>
    new Promise<void>((resolve, reject) => {
      server = http.createServer((req, res) => {
        // Apply permissive CORS for tests
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }

        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          try {
            _requests.push({ method: req.method || 'GET', url: req.url, body });
          } catch (e) {}
          try {
            const result = handler(req, body);
            if (!result) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, message: 'Not found' }));
              return;
            }
            res.writeHead(result.status || 200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.body));
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: err?.message || 'Server error' }));
          }
        });
      });

      const srv = server!;
      const onError = (err: any) => {
        if (err && err.code === 'EADDRINUSE') {
          srv.removeListener('error', onError);
          return reject(new Error(`Port ${port} already in use`));
        }
        srv.removeListener('error', onError);
        reject(err);
      };

      srv.on('error', onError);
      srv.listen(port, () => {
        srv.removeListener('error', onError);
        resolve();
      });
    });

  const stop = () =>
    new Promise<void>((resolve) => {
      if (!server) return resolve();
      server.close(() => {
        server = null;
        resolve();
      });
    });

  const getRequests = () => _requests;

  return { start, stop, getRequests };
}
