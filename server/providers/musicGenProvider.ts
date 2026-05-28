import type { GeneratedTrack, GenerateTrackInput } from '../../src/types/music.js';
import type { MusicProvider } from './types.js';

type ReplicatePredictionStatus =
  | 'starting'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled';

type ReplicatePrediction = {
  error?: string | null;
  output?: string | string[] | null;
  status?: ReplicatePredictionStatus;
  urls?: {
    get?: string;
  };
};

const replicateApiBaseUrl = 'https://api.replicate.com/v1';
const replicatePollIntervalMs = 2_000;
const replicatePollTimeoutMs = 120_000;

function getReplicateApiToken() {
  return process.env.REPLICATE_API_TOKEN ?? process.env.MUSICGEN_API_KEY ?? '';
}

function getMusicGenModelVersion() {
  return process.env.MUSICGEN_MODEL_VERSION ?? 'large';
}

function createTitle(input: GenerateTrackInput) {
  const promptSeed = input.prompt.trim().split(/\s+/).slice(0, 4).join(' ');
  const titleBase = promptSeed || `${input.mood} ${input.genre}`;

  return `${titleBase} Mix`;
}

function createPrompt(input: GenerateTrackInput) {
  return [
    `Create a polished 30-second instrumental music track.`,
    `Genre: ${input.genre}.`,
    `Mood: ${input.mood}.`,
    `Prompt: ${input.prompt}.`,
    `Keep a clear musical structure, strong intro, and clean ending within 30 seconds.`,
    `No spoken words.`,
  ].join(' ');
}

function getOutputUrl(output: ReplicatePrediction['output']) {
  if (typeof output === 'string' && output.length > 0) {
    return output;
  }

  if (Array.isArray(output)) {
    const firstOutput = output.find(
      (value): value is string => typeof value === 'string' && value.length > 0,
    );

    if (firstOutput) {
      return firstOutput;
    }
  }

  return null;
}

async function parsePredictionResponse(response: Response) {
  const payload = (await response.json()) as
    | ReplicatePrediction
    | { detail?: string; title?: string };

  if (!response.ok) {
    const message =
      'detail' in payload && typeof payload.detail === 'string'
        ? payload.detail
        : 'Replicate rejected the MusicGen request.';

    throw new Error(message);
  }

  return payload as ReplicatePrediction;
}

async function fetchPrediction(
  url: string,
  token: string,
  init?: RequestInit,
): Promise<ReplicatePrediction> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  return parsePredictionResponse(response);
}

async function waitForPredictionCompletion(
  prediction: ReplicatePrediction,
  token: string,
) {
  if (prediction.status === 'succeeded') {
    return prediction;
  }

  if (prediction.status === 'failed' || prediction.status === 'canceled') {
    throw new Error(
      prediction.error || 'Music generation did not complete successfully.',
    );
  }

  const predictionUrl = prediction.urls?.get;

  if (!predictionUrl) {
    throw new Error('Music generation started but no polling URL was returned.');
  }

  const startedAt = Date.now();
  let currentPrediction = prediction;

  while (Date.now() - startedAt < replicatePollTimeoutMs) {
    await new Promise((resolve) => {
      setTimeout(resolve, replicatePollIntervalMs);
    });

    currentPrediction = await fetchPrediction(predictionUrl, token, {
      method: 'GET',
    });

    if (currentPrediction.status === 'succeeded') {
      return currentPrediction;
    }

    if (
      currentPrediction.status === 'failed' ||
      currentPrediction.status === 'canceled'
    ) {
      throw new Error(
        currentPrediction.error ||
          'Music generation failed while waiting for the result.',
      );
    }
  }

  throw new Error('Music generation timed out. Please try again.');
}

export const musicGenProvider: MusicProvider = {
  name: 'musicgen',
  async generateTrack(input): Promise<GeneratedTrack> {
    const replicateApiToken = getReplicateApiToken();

    if (!replicateApiToken) {
      throw new Error(
        'Missing Replicate API token. Set REPLICATE_API_TOKEN in the server environment.',
      );
    }

    const prediction = await fetchPrediction(
      `${replicateApiBaseUrl}/models/meta/musicgen/predictions`,
      replicateApiToken,
      {
        method: 'POST',
        headers: {
          'Cancel-After': '2m',
          Prefer: 'wait=90',
        },
        body: JSON.stringify({
          input: {
            classifier_free_guidance: 3,
            duration: 30,
            model_version: getMusicGenModelVersion(),
            output_format: 'wav',
            prompt: createPrompt(input),
            temperature: 1,
            top_k: 250,
          },
        }),
      },
    );

    const completedPrediction = await waitForPredictionCompletion(
      prediction,
      replicateApiToken,
    );
    const audioUrl = getOutputUrl(completedPrediction.output);

    if (!audioUrl) {
      throw new Error('MusicGen completed but did not return an audio file.');
    }

    return {
      audioUrl,
      duration: '0:30',
      genre: input.genre,
      mood: input.mood,
      title: createTitle(input),
    };
  },
};
