import type { IncomingMessage, ServerResponse } from 'node:http';
import { getMusicProvider } from '../providers/providerFactory';
import type { GenerateTrackInput } from '../../src/types/music';

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown,
) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });

    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON request body.'));
      }
    });

    request.on('error', reject);
  });
}

function isGenerateTrackInput(value: unknown): value is GenerateTrackInput {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const input = value as Record<string, unknown>;

  return (
    typeof input.prompt === 'string' &&
    typeof input.genre === 'string' &&
    typeof input.mood === 'string'
  );
}

export async function handleGenerateTrackRoute(
  request: IncomingMessage,
  response: ServerResponse,
) {
  try {
    const body = await readJsonBody(request);

    if (!isGenerateTrackInput(body)) {
      sendJson(response, 400, {
        message: 'Request must include prompt, genre, and mood.',
      });
      return;
    }

    const provider = getMusicProvider();
    const track = await provider.generateTrack(body);
    sendJson(response, 200, track);
  } catch (error) {
    sendJson(response, 500, {
      message:
        error instanceof Error
          ? error.message
          : 'Something went wrong while generating the track.',
    });
  }
}

export function sendRouteJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown,
) {
  sendJson(response, statusCode, payload);
}
