const { spawn } = require('child_process');

console.log('Testing Python MetaTrader5 package...\n');

const python = spawn('python', [
    '-c',
    'import MetaTrader5 as mt5; print("ok")'
]);

python.stdout.on('data', (data) => {
    console.log('✓ MetaTrader5 package is installed');
});

python.stderr.on('data', (data) => {
    console.log('✗ Error:', data.toString());
    console.log('\nTo install, run: pip install MetaTrader5');
});

python.on('close', (code) => {
    if (code !== 0) {
        console.log('\nPackage not found. Install with: pip install MetaTrader5');
    }
    process.exit(code);
});