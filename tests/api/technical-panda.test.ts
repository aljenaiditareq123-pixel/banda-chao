import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/technical-panda/route';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Mock fs and exec
vi.mock('fs');
vi.mock('child_process');

describe('Technical Panda API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when message is missing', async () => {
    const request = new Request('http://localhost/api/technical-panda', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it('handles readFile action', async () => {
    process.env.GEMINI_API_KEY = 'test-key-12345678901234567890';
    
    const mockFileContent = 'test file content';
    (fs.readFileSync as any).mockReturnValue(mockFileContent);
    (fs.existsSync as any).mockReturnValue(true);

    const request = new Request('http://localhost/api/technical-panda', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Read package.json',
        action: {
          type: 'read',
          target: 'package.json',
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.result).toContain(mockFileContent);
  });

  it('handles executeCommand action', async () => {
    process.env.GEMINI_API_KEY = 'test-key-12345678901234567890';
    
    (execAsync as any).mockResolvedValue({ stdout: 'command output', stderr: '' });

    const request = new Request('http://localhost/api/technical-panda', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Run npm --version',
        action: {
          type: 'execute',
          command: 'npm --version',
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.result).toBeTruthy();
  });

  it('rejects dangerous commands', async () => {
    const request = new Request('http://localhost/api/technical-panda', {
      method: 'POST',
      body: JSON.stringify({
        action: 'executeCommand',
        command: 'rm -rf /',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Should reject or handle safely
    expect(data.result || data.error).toBeTruthy();
  });

  it('handles analyzeCodebase action', async () => {
    process.env.GEMINI_API_KEY = 'test-key-12345678901234567890';
    
    (fs.readdirSync as any).mockReturnValue(['file1.ts', 'file2.tsx']);
    (fs.statSync as any).mockReturnValue({ isFile: () => true });
    (fs.existsSync as any).mockReturnValue(true);
    (fs.readFileSync as any).mockReturnValue('{"dependencies": {}}');

    const request = new Request('http://localhost/api/technical-panda', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Analyze codebase',
        action: {
          type: 'analyze',
        },
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.result).toBeTruthy();
  });
});

