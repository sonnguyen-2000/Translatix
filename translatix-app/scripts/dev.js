const { execSync, spawn } = require('child_process');
const path = require('path');

const backendPath = path.resolve(__dirname, '..', '..', 'translatix-backend');
const venvPython = path.join(backendPath, 'venv', 'Scripts', 'python.exe');
const uvicornCommand = `"${venvPython}" -m uvicorn app.main:app --reload`;

try {
  // Kiểm tra Python venv tồn tại
  execSync(`${venvPython} --version`, { stdio: 'ignore' });

  console.log('[INFO] ✅ Virtual environment detected.');
} catch (err) {
  console.error('[ERROR] ❌ Virtual environment not found. Hãy tạo venv trong translatix-backend trước.');
  process.exit(1);
}

// Chạy backend FastAPI
const backendProcess = spawn(uvicornCommand, {
  cwd: backendPath,
  shell: true,
  stdio: 'inherit',
});

// Chạy Next.js + Electron song song
const concurrently = require('concurrently');
concurrently([
  { command: 'npm run dev:next', name: 'next', prefixColor: 'cyan' },
  { command: 'npm run dev:electron', name: 'electron', prefixColor: 'green' }
]).then(() => {
  backendProcess.kill();
});
