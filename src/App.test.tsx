import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const mockTrack = {
  title: 'Mock Ambient Sketch',
  duration: '0:03',
  audioUrl: 'data:audio/wav;base64,UklGRg==',
  genre: 'Ambient',
  mood: 'Dreamy',
};

function mockFetchSuccess() {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockTrack),
        ok: true,
      }),
    ),
  );
}

function mockFetchError(message = 'Mock generation failed.') {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message }),
        ok: false,
      }),
    ),
  );
}

describe('AI Music Dashboard', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    mockFetchSuccess();
  });

  it('renders the prompt input area', () => {
    render(<App />);

    expect(screen.getByLabelText(/music prompt/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^generate$/i }),
    ).toBeInTheDocument();
  });

  it('updates the prompt when a preset is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /lo-fi study beat/i }));

    expect(screen.getByLabelText(/music prompt/i)).toHaveValue(
      'Dusty lo-fi study beat with mellow chords and relaxed drums',
    );
  });

  it('enters loading state after Generate is clicked', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise(() => {
            // Keep the request pending so the loading UI can be asserted.
          }),
      ),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^generate$/i }));

    expect(screen.getByText(/composing preview/i)).toBeInTheDocument();
    expect(
      screen.getAllByText(/generating a new 30-second track/i).length,
    ).toBeGreaterThan(0);
  });

  it('shows the generated track after a successful response', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^generate$/i }));

    expect(
      await screen.findByRole('heading', { name: 'Mock Ambient Sketch' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/ambient \/ dreamy/i).length).toBeGreaterThan(
      0,
    );
  });

  it('shows an error fallback when generation fails', async () => {
    mockFetchError('The mock API is unavailable.');
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^generate$/i }));

    expect(await screen.findByText(/generation failed/i)).toBeInTheDocument();
    expect(screen.getByText(/mock api is unavailable/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /retry generation/i }),
    ).toBeInTheDocument();
  });

  it('renders generation history after a successful generation', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^generate$/i }));

    await waitFor(() => {
      expect(screen.getAllByText('Mock Ambient Sketch').length).toBeGreaterThan(
        1,
      );
    });
  });
});
