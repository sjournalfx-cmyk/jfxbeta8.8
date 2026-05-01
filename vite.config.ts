import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const readNvidiaKey = () => {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const contents = fs.readFileSync(envPath, 'utf8');
    const match = contents.match(/^NVIDIA_API_KEY=(?:"([^"]+)"|([^"\r\n]+))/m);
    return match?.[1] || match?.[2] || '';
  } catch {
    return '';
  }
};

function runPythonScript(scriptName: string, args: string[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'scripts', scriptName);
    
    const python = spawn('python', [scriptPath, ...args], {
      shell: true,
      windowsHide: true
    });

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0 && errorOutput) {
        reject(new Error(errorOutput.trim()));
      } else {
        try {
          resolve(JSON.parse(output.trim()));
        } catch (e) {
          reject(new Error('Invalid JSON from Python script'));
        }
      }
    });

    python.on('error', (err) => {
      reject(err);
    });

    setTimeout(() => {
      python.kill();
      reject(new Error('Python script timeout'));
    }, 30000);
  });
}

const mt5PythonPlugin = (): Plugin => {
  return {
    name: 'mt5-python-plugin',
    configureServer(server) {
      server.middlewares.use('/api/mt5/connect', async (req, res) => {
        try {
          const data = await runPythonScript('mt5.py', []);
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            login: data.login,
            server: data.server,
            balance: data.balance,
            equity: data.equity,
            margin: data.margin,
            free_margin: data.free_margin,
            profit: data.profit,
            currency: data.currency
          }));
        } catch (error: any) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 400;
          res.end(JSON.stringify({
            success: false,
            error: error.message || 'Could not connect to MT5'
          }));
        }
      });

      server.middlewares.use('/api/mt5/status', async (req, res) => {
        try {
          const data = await runPythonScript('mt5.py', ['status']);
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            connected: true,
            login: data.login,
            server: data.server,
            balance: data.balance,
            equity: data.equity,
            margin: data.margin,
            free_margin: data.free_margin,
            profit: data.profit
          }));
        } catch (error: any) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 400;
          res.end(JSON.stringify({
            connected: false,
            error: error.message
          }));
        }
      });

      server.middlewares.use('/api/mt5/positions', async (req, res) => {
        try {
          const data = await runPythonScript('mt5.py', ['positions']);
          
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            positions: data.positions || [],
            count: data.positions?.length || 0
          }));
        } catch (error: any) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 400;
          res.end(JSON.stringify({ error: error.message }));
        }
      });

      server.middlewares.use('/api/mt5/open', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        try {
          let body = '';
          req.on('data', chunk => body += chunk);
          await new Promise(resolve => req.on('end', resolve));
          const { symbol, volume, direction, sl, tp } = JSON.parse(body);

          const result = await runPythonScript('mt5.py', ['open', symbol, String(volume || 0.01), direction || 'BUY', String(sl || 0), String(tp || 0)]);
          
          if (result.error) {
            throw new Error(result.error);
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result));
        } catch (error: any) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 400;
          res.end(JSON.stringify({ error: error.message }));
        }
      });

      server.middlewares.use('/api/mt5/close', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        try {
          let body = '';
          req.on('data', chunk => body += chunk);
          await new Promise(resolve => req.on('end', resolve));
          const { ticket } = JSON.parse(body);

          if (!ticket) {
            throw new Error('Ticket required');
          }

          const result = await runPythonScript('mt5.py', ['close', String(ticket)]);
          
          if (result.error) {
            throw new Error(result.error);
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result));
        } catch (error: any) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 400;
          res.end(JSON.stringify({ error: error.message }));
        }
});
    }
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './test/setup.ts'
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-charts': ['lightweight-charts'],
            'vendor-tiptap': [
              '@tiptap/react',
              '@tiptap/starter-kit',
              '@tiptap/extension-image',
              '@tiptap/extension-link',
              '@tiptap/extension-table',
              '@tiptap/extension-color',
              '@tiptap/extension-text-style',
              '@tiptap/extension-underline',
              '@tiptap/extension-task-list',
              '@tiptap/extension-task-item',
            ],
            'vendor-ui': ['@dnd-kit/core', '@dnd-kit/sortable', 'motion', 'lucide-react'],
            'vendor-ai': ['@google/generative-ai', 'agentation'],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/nvidia': {
          target: 'https://integrate.api.nvidia.com',
          changeOrigin: true,
          secure: true,
          rewrite: () => '/v1/chat/completions',
        },
      },
    },
    plugins: [react(), mt5PythonPlugin()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'use-sync-external-store/shim': path.resolve(__dirname, 'shims/use-sync-external-store/shim'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react'],
      exclude: ['@google/generative-ai'],
    },
  };
});