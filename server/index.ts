import { createServer } from 'node:http';
import {
  handleGenerateTrackRoute,
  sendRouteJson,
} from './routes/generateTrackRoute';

const port = Number(process.env.API_PORT ?? 3001);

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendRouteJson(response, 204, {});
    return;
  }

  if (request.url === '/api/generate-track' && request.method === 'POST') {
    await handleGenerateTrackRoute(request, response);
    return;
  }

  sendRouteJson(response, 404, { message: 'Not found.' });
});

server.listen(port, () => {
  console.log(`Music API server listening on http://127.0.0.1:${port}`);
});
