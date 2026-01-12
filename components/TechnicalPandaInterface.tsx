'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';

interface TechnicalPandaInterfaceProps {
  onAction?: (action: { type: string; target?: string; content?: string; command?: string }) => void;
}

export default function TechnicalPandaInterface({ onAction }: TechnicalPandaInterfaceProps) {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionResult, setActionResult] = useState('');

  const handleAsk = async () => {
    if (!message.trim() || loading) return;

    setLoading(true);
    setResponse('');
    setActionResult('');

    try {
      const res = await fetch('/api/technical-panda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = await res.json();
      
      if (data.error) {
        setResponse(`❌ Error: ${data.error}`);
      } else {
        setResponse(data.reply || 'No response');
        
        // If AI suggests actions, show them
        if (data.suggestions && data.suggestions.length > 0) {
          setResponse(prev => prev + `\n\n💡 Suggested actions:\n${data.suggestions.join('\n')}`);
        }
      }
    } catch (error: any) {
      setResponse(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectAction = async (action: { type: string; target?: string; content?: string; command?: string }) => {
    setLoading(true);
    setActionResult('');

    try {
      const res = await fetch('/api/technical-panda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `Execute ${action.type} action`,
          action 
        }),
      });

      const data = await res.json();
      setActionResult(data.result || data.error || 'Action completed');
      
      if (onAction) {
        onAction(action);
      }
    } catch (error: any) {
      setActionResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">💻 Technical Panda - Active Developer</h3>
        
        <div className="space-y-4">
          <Input
            placeholder="Ask Technical Panda to do something... (e.g., 'Fix the header component', 'Add a new feature', 'Check for bugs')"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
          />
          
          <div className="flex gap-2">
            <Button onClick={handleAsk} disabled={loading || !message.trim()}>
              {loading ? 'Working...' : 'Ask & Act'}
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={() => handleDirectAction({ type: 'analyze' })}
              disabled={loading}
            >
              🔍 Analyze Codebase
            </Button>
          </div>
        </div>
      </div>

      {response && (
        <div className="bg-slate-700 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-2">Response:</h4>
          <pre className="text-white/90 whitespace-pre-wrap text-sm">{response}</pre>
        </div>
      )}

      {actionResult && (
        <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-500">
          <h4 className="text-lg font-semibold text-emerald-200 mb-2">Action Result:</h4>
          <pre className="text-emerald-100 whitespace-pre-wrap text-sm">{actionResult}</pre>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Quick Actions:</h4>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            onClick={() => handleDirectAction({ type: 'read', target: 'package.json' })}
            disabled={loading}
            className="text-sm"
          >
            📄 Read package.json
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => handleDirectAction({ type: 'execute', command: 'npm run lint' })}
            disabled={loading}
            className="text-sm"
          >
            🔍 Run Linter
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => handleDirectAction({ type: 'analyze' })}
            disabled={loading}
            className="text-sm"
          >
            📊 Analyze Codebase
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => handleDirectAction({ type: 'execute', command: 'npm outdated' })}
            disabled={loading}
            className="text-sm"
          >
            📦 Check Updates
          </Button>
        </div>
      </div>
    </div>
  );
}

