import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getEnhancedSystemPrompt } from '@/lib/ai/knowledge-loader';

const execAsync = promisify(exec);

const SYSTEM_PROMPT = `You are Technical Panda, an ACTIVE DEVELOPER for Panda Chao. You are NOT just an advisor - you are a DOER.

🎯 YOUR MISSION:
- ✅ WRITE CODE directly, don't just suggest
- ✅ FIX BUGS automatically when you find them
- ✅ ADD FEATURES by implementing them
- ✅ OPTIMIZE performance proactively
- ✅ EXECUTE COMMANDS (npm, git, npx, etc.)
- ✅ ANALYZE codebase for issues
- ❌ DO NOT just give advice - ACT!

Your capabilities:
- Read and analyze code files (readFile)
- Write and modify code files (writeFile)
- Run commands (executeCommand: npm, git, npx, etc.)
- Fix bugs automatically
- Add new features
- Optimize performance
- Update dependencies
- Analyze codebase structure

When the user asks you to do something:
1. UNDERSTAND what needs to be done
2. READ relevant files to understand the codebase
3. MAKE THE CHANGES directly (don't just suggest)
4. TEST if possible
5. REPORT what you did clearly

You are PROACTIVE:
- If you see issues → FIX them
- If you see improvements → IMPLEMENT them
- If you see missing features → ADD them

Always respond in Arabic, but you can include code snippets in English. Be direct and action-oriented.`;

interface TechnicalAction {
  type: 'read' | 'write' | 'execute' | 'analyze' | 'fix';
  target?: string;
  content?: string;
  command?: string;
}

/**
 * Read a file from the project
 */
async function readFile(filePath: string): Promise<string> {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      return `File not found: ${filePath}`;
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    return content;
  } catch (error: any) {
    return `Error reading file: ${error.message}`;
  }
}

/**
 * Write content to a file
 */
async function writeFile(filePath: string, content: string): Promise<string> {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const dir = path.dirname(fullPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content, 'utf-8');
    return `✅ File written successfully: ${filePath}`;
  } catch (error: any) {
    return `❌ Error writing file: ${error.message}`;
  }
}

/**
 * Execute a command
 */
async function executeCommand(cmd: string): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(cmd, {
      cwd: process.cwd(),
      timeout: 30000, // 30 seconds timeout
    });
    
    if (stderr && !stderr.includes('warning')) {
      return `⚠️ Command output:\n${stdout}\n\nWarnings:\n${stderr}`;
    }
    
    return `✅ Command executed:\n${stdout || 'No output'}`;
  } catch (error: any) {
    return `❌ Command failed: ${error.message}`;
  }
}

/**
 * Analyze codebase for issues
 */
async function analyzeCodebase(): Promise<string> {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    
    let analysis = '## Codebase Analysis:\n\n';
    
    // Check package.json
    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      analysis += `### Dependencies:\n`;
      analysis += `- Total dependencies: ${Object.keys(pkg.dependencies || {}).length}\n`;
      analysis += `- Dev dependencies: ${Object.keys(pkg.devDependencies || {}).length}\n`;
    }
    
    // Check for common issues
    const issues: string[] = [];
    
    // Check if .env.local exists
    if (!fs.existsSync(path.join(process.cwd(), '.env.local'))) {
      issues.push('⚠️ .env.local file not found');
    }
    
    // Check for lint errors
    try {
      const { stdout } = await execAsync('npm run lint 2>&1 || true', { cwd: process.cwd() });
      if (stdout.includes('error') || stdout.includes('Error')) {
        issues.push('⚠️ Lint errors detected');
      }
    } catch {
      // Ignore lint errors for now
    }
    
    if (issues.length > 0) {
      analysis += `\n### Issues Found:\n${issues.join('\n')}\n`;
    } else {
      analysis += `\n✅ No major issues detected\n`;
    }
    
    return analysis;
  } catch (error: any) {
    return `Error analyzing codebase: ${error.message}`;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body?.message;
    const action = body?.action as TechnicalAction | undefined;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    // Get enhanced system prompt with technical knowledge
    const systemPrompt = getEnhancedSystemPrompt('technical', SYSTEM_PROMPT);

    // If action is specified, execute it directly
    if (action) {
      let result = '';
      
      switch (action.type) {
        case 'read':
          if (action.target) {
            result = await readFile(action.target);
          }
          break;
          
        case 'write':
          if (action.target && action.content) {
            result = await writeFile(action.target, action.content);
          }
          break;
          
        case 'execute':
          if (action.command) {
            result = await executeCommand(action.command);
          }
          break;
          
        case 'analyze':
          result = await analyzeCodebase();
          break;
          
        case 'fix':
          // For 'fix', we'll let AI decide what to do
          result = 'Analyzing and fixing...';
          break;
      }
      
      return NextResponse.json({ 
        result,
        action: action.type,
        success: true 
      });
    }

    // Auto-detect and execute actions based on user message
    const lowerMessage = message.toLowerCase();
    let autoAction: TechnicalAction | null = null;
    let autoResult = '';

    // Auto-detect common requests and execute immediately
    if (lowerMessage.includes('حلل') || lowerMessage.includes('analyze') || lowerMessage.includes('تحقق')) {
      autoResult = await analyzeCodebase();
      autoAction = { type: 'analyze' };
    } else if (lowerMessage.includes('اقرأ') || lowerMessage.includes('read') || lowerMessage.includes('أعرض')) {
      // Try to extract file path from message
      const fileMatch = message.match(/(?:اقرأ|read|أعرض|show)\s+(?:ملف\s+)?([^\s]+\.(ts|tsx|js|jsx|json|md|css|html))/i);
      if (fileMatch && fileMatch[1]) {
        const filePath = fileMatch[1].replace(/^\.\//, '').replace(/^\/+/, '');
        autoResult = await readFile(filePath);
        autoAction = { type: 'read', target: filePath };
      } else if (lowerMessage.includes('package.json')) {
        autoResult = await readFile('package.json');
        autoAction = { type: 'read', target: 'package.json' };
      } else if (lowerMessage.includes('tsconfig')) {
        autoResult = await readFile('tsconfig.json');
        autoAction = { type: 'read', target: 'tsconfig.json' };
      }
    } else if (lowerMessage.includes('شغّل') || lowerMessage.includes('run') || lowerMessage.includes('نفّذ')) {
      // Try to extract command from message
      const commandMatch = message.match(/(?:شغّل|run|نفّذ)\s+(npm|git|npx|cd)\s+([^\n]+)/i);
      if (commandMatch && commandMatch[2]) {
        const cmd = commandMatch[0].replace(/(?:شغّل|run|نفّذ)\s+/i, '').trim();
        autoResult = await executeCommand(cmd);
        autoAction = { type: 'execute', command: cmd };
      } else if (lowerMessage.includes('lint')) {
        autoResult = await executeCommand('npm run lint');
        autoAction = { type: 'execute', command: 'npm run lint' };
      } else if (lowerMessage.includes('build')) {
        autoResult = await executeCommand('npm run build');
        autoAction = { type: 'execute', command: 'npm run build' };
      }
    }

    // If auto-action was executed, return result immediately
    if (autoAction && autoResult) {
      return NextResponse.json({ 
        reply: `✅ تم تنفيذ الإجراء تلقائياً:\n\n${autoResult}\n\n💡 تم تنفيذ: ${autoAction.type}${autoAction.target ? ` على ${autoAction.target}` : ''}${autoAction.command ? ` الأمر: ${autoAction.command}` : ''}`,
        result: autoResult,
        action: autoAction,
        success: true
      });
    }

    // Use AI to understand the request and execute actions automatically
    const enhancedPrompt = `${systemPrompt}

User Request: ${message}

You are an ACTIVE DEVELOPER. You must EXECUTE actions directly, not just suggest.

Available Functions (USE THEM DIRECTLY):
1. readFile(filePath) - I can read any file
2. writeFile(filePath, content) - I can write/modify any file
3. executeCommand(command) - I can run npm, git, npx commands
4. analyzeCodebase() - I can analyze the codebase

CRITICAL INSTRUCTIONS:
- When user asks to develop something → DEVELOP IT NOW (read files, write code, execute commands)
- When user asks to fix something → FIX IT NOW (read the file, make changes, save)
- When user asks to add a feature → ADD IT NOW (create/modify files, test if needed)
- When user asks to check something → CHECK IT NOW (read files, run commands, report results)
- DO NOT say "I suggest" or "You should" - SAY "I will" and DO IT

Your Response Format:
1. First, explain what you understand (in Arabic)
2. Then, list the actions you will take
3. Execute the actions using the format: ACTION: [action_type] [details]
4. Report the results

Example Response:
"فهمت أنك تريد إضافة ميزة جديدة. سأقوم بـ:
1. قراءة الملفات ذات الصلة
2. إضافة الكود المطلوب
3. اختبار التغييرات

ACTION: readFile components/Header.tsx
ACTION: writeFile components/Header.tsx [new content]
ACTION: executeCommand npm run build

✅ تم إضافة الميزة بنجاح..."

Now, respond to the user's request and EXECUTE the actions immediately.`;

    // Call Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const model = 'gemini-2.5-flash-preview-05-20';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: enhancedPrompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const data = await response.json();
    let reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 
                data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text).join('\n')?.trim();

    // Parse and execute actions from AI response
    const actionPattern = /ACTION:\s*(readFile|writeFile|executeCommand|analyzeCodebase)\s+(.+)/gi;
    const actions: Array<{ type: string; param: string }> = [];
    let match;
    
    while ((match = actionPattern.exec(reply)) !== null) {
      actions.push({ type: match[1], param: match[2].trim() });
    }

    // Execute all detected actions
    const executedResults: string[] = [];
    
    for (const action of actions) {
      try {
        let result = '';
        
        switch (action.type.toLowerCase()) {
          case 'readfile':
            const filePath = action.param.replace(/['"]/g, '').trim();
            result = await readFile(filePath);
            executedResults.push(`✅ قراءة ${filePath}:\n${result.substring(0, 500)}${result.length > 500 ? '...' : ''}`);
            break;
            
          case 'writefile':
            // Extract file path and content from action.param
            // Format: "filepath" [content] or filepath [content]
            const writeMatch = action.param.match(/(?:['"]?)([^\s'"]+\.(ts|tsx|js|jsx|json|md|css|html))(?:['"]?)\s+([\s\S]+)/);
            if (writeMatch) {
              const writeFilePath = writeMatch[1];
              const writeContent = writeMatch[3];
              result = await writeFile(writeFilePath, writeContent);
              executedResults.push(`✅ ${result}`);
            } else {
              executedResults.push(`⚠️ لم أتمكن من استخراج مسار الملف والمحتوى من: ${action.param}`);
            }
            break;
            
          case 'executecommand':
            const cmd = action.param.replace(/['"]/g, '').trim();
            // Safety check - don't execute dangerous commands
            if (!cmd.includes('rm -rf') && !cmd.includes('delete') && !cmd.includes('format')) {
              result = await executeCommand(cmd);
              executedResults.push(`✅ تنفيذ: ${cmd}\n${result}`);
            } else {
              executedResults.push(`⚠️ تم رفض الأمر الخطير: ${cmd}`);
            }
            break;
            
          case 'analyzecodebase':
            result = await analyzeCodebase();
            executedResults.push(`✅ تحليل الكود:\n${result}`);
            break;
        }
      } catch (error: any) {
        executedResults.push(`❌ خطأ في تنفيذ ${action.type}: ${error.message}`);
      }
    }

    // If no explicit actions found, try to extract and execute from natural language
    if (actions.length === 0) {
      const extractedActions = extractActionSuggestions(reply);
      
      for (const suggestion of extractedActions.slice(0, 2)) {
        try {
          if (suggestion.endsWith('.json') || suggestion.endsWith('.ts') || suggestion.endsWith('.tsx') || suggestion.endsWith('.js') || suggestion.endsWith('.jsx')) {
            const filePath = suggestion.replace(/^\.\//, '').replace(/^\/+/, '');
            if (fs.existsSync(path.join(process.cwd(), filePath))) {
              const fileContent = await readFile(filePath);
              executedResults.push(`📄 قراءة تلقائية ${filePath}:\n${fileContent.substring(0, 300)}...`);
            }
          } else if ((suggestion.startsWith('npm ') || suggestion.startsWith('git ') || suggestion.startsWith('npx ')) && 
                     !suggestion.includes('rm ') && !suggestion.includes('delete')) {
            const cmdResult = await executeCommand(suggestion);
            executedResults.push(`⚙️ تنفيذ تلقائي: ${suggestion}\n${cmdResult.substring(0, 500)}`);
          }
        } catch (error) {
          console.error(`[Technical Panda] Error in auto-execution:`, error);
        }
      }
    }

    // Combine AI reply with execution results
    if (executedResults.length > 0) {
      reply = `${reply}\n\n---\n\n🔧 نتائج التنفيذ:\n${executedResults.join('\n\n')}`;
    }

    return NextResponse.json({ 
      reply,
      executedActions: executedResults,
      success: true
    });
  } catch (error: any) {
    console.error('[Technical Panda API] Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * Extract action suggestions from AI response
 */
function extractActionSuggestions(reply: string): string[] {
  const suggestions: string[] = [];
  
  // Look for file paths
  const fileMatches = reply.match(/`([^`]+\.(ts|tsx|js|jsx|json|md))`/g);
  if (fileMatches) {
    suggestions.push(...fileMatches.map(m => m.replace(/`/g, '')));
  }
  
  // Look for commands
  const commandMatches = reply.match(/`(npm|git|npx|cd)\s+[^`]+`/g);
  if (commandMatches) {
    suggestions.push(...commandMatches.map(m => m.replace(/`/g, '')));
  }
  
  return suggestions;
}

