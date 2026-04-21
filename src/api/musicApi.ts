import type { GeneratedTrack, GenerateTrackInput } from '../types/music';

export async function generateTrack(
  input: GenerateTrackInput,
): Promise<GeneratedTrack> {
  const response = await fetch('/api/generate-track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as
    | GeneratedTrack
    | { message?: string };

  if (!response.ok) {
    throw new Error(
      'message' in payload && payload.message
        ? payload.message
        : 'Something went wrong while generating the track.',
    );
  }

  return payload as GeneratedTrack;
}
