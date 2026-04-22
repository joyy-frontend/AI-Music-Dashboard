import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  handleGenerateTrackRoute,
  sendRouteJson,
} from '../server/routes/generateTrackRoute.js';

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse,
) {
  if (request.method === 'OPTIONS') {
    sendRouteJson(response, 204, {});
    return;
  }

  if (request.method !== 'POST') {
    sendRouteJson(response, 405, { message: 'Method not allowed.' });
    return;
  }

  await handleGenerateTrackRoute(request, response);
}
