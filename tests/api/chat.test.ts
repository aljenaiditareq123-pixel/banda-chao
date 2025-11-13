import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/chat/route';

// Mock environment variables
vi.mock('process', () => ({
  env: {
    GEMINI_API_KEY: 'test-key',
    OPENAI_API_KEY: undefined,
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('Chat API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when message is missing', async () => {
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Message is required');
  });

  it('returns error when message is not a string', async () => {
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 123 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Message is required');
  });

  it('calls Gemini API when GEMINI_API_KEY is available', async () => {
    const mockGeminiResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: 'Test response from Gemini' }],
          },
        },
      ],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockGeminiResponse,
    });

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reply).toBe('Test response from Gemini');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('generativelanguage.googleapis.com'),
      expect.any(Object)
    );
  });

  it('returns error when no API keys are configured', async () => {
    // Temporarily remove API key
    const originalEnv = process.env.GEMINI_API_KEY;
    delete (process.env as any).GEMINI_API_KEY;

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('No AI provider is configured');

    // Restore
    process.env.GEMINI_API_KEY = originalEnv;
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeTruthy();
  });
});

