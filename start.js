/* This script starts the FastAPI and Next.js servers, setting up user configuration if necessary. It reads environment variables to configure API keys and other settings, ensuring that the user configuration file is created if it doesn't exist. The script also handles the starting of both servers and keeps the Node.js process alive until one of the servers exits. */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { existsSync, mkdirSync, rmSync, cpSync, readFileSync, writeFileSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastapiDir = join(__dirname, 'servers/fastapi');
const nextjsDir = join(__dirname, 'servers/nextjs');

const args = process.argv.slice(2);
const hasDevArg = args.includes('--dev') || args.includes('-d');
const isDev = hasDevArg;
const canChangeKeys = process.env.CAN_CHANGE_KEYS !== 'false';

const fastapiPort = 8000;
const nextjsPort = 3000;
const appmcpPort = 8001;


const userConfigPath = join(process.env.APP_DATA_DIRECTORY, 'userConfig.json');
const userDataDir = dirname(userConfigPath);

// Create user_data directory if it doesn't exist
if (!existsSync(userDataDir)) {
  mkdirSync(userDataDir, { recursive: true });
}

// Setup node_modules for development
const setupNodeModules = () => {
  console.log('Setting up node_modules for development...');
  const nodeDependenciesPath = '/node_dependencies/node_modules';
  const nextjsNodeModulesPath = join(nextjsDir, 'node_modules');

  if (existsSync(nodeDependenciesPath)) {
    const targetExists = existsSync(nextjsNodeModulesPath);
    if (!targetExists) {
      cpSync(nodeDependenciesPath, nextjsNodeModulesPath, { recursive: true });
      console.log('Initialized node_modules from /node_dependencies');
      return;
    }
    // If target exists (e.g., mounted volume), only populate if empty; do not remove mountpoint
    try {
      const entries = readdirSync(nextjsNodeModulesPath);
      if (!entries || entries.length === 0) {
        cpSync(nodeDependenciesPath, nextjsNodeModulesPath, { recursive: true });
        console.log('Populated empty node_modules from /node_dependencies');
      } else {
        console.log('node_modules already present; skipping copy');
      }
    } catch (err) {
      console.warn('Could not inspect node_modules; skipping copy:', err?.message || err);
    }
  }
};


process.env.USER_CONFIG_PATH = userConfigPath;

//? UserConfig is only setup if API Keys can be changed
const setupUserConfigFromEnv = () => {
  let existingConfig = {};

  if (existsSync(userConfigPath)) {
    existingConfig = JSON.parse(readFileSync(userConfigPath, 'utf8'));
  }

  if (!["ollama", "openai", "google"].includes(existingConfig.LLM)) {
    existingConfig.LLM = undefined;
  }

  const userConfig = {
    LLM: process.env.LLM || existingConfig.LLM,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || existingConfig.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL || existingConfig.OPENAI_MODEL,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || existingConfig.GOOGLE_API_KEY,
    GOOGLE_MODEL: process.env.GOOGLE_MODEL || existingConfig.GOOGLE_MODEL,
    OLLAMA_URL: process.env.OLLAMA_URL || existingConfig.OLLAMA_URL,
    OLLAMA_MODEL: process.env.OLLAMA_MODEL || existingConfig.OLLAMA_MODEL,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || existingConfig.ANTHROPIC_API_KEY,
    ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || existingConfig.ANTHROPIC_MODEL,
    CUSTOM_LLM_URL: process.env.CUSTOM_LLM_URL || existingConfig.CUSTOM_LLM_URL,
    CUSTOM_LLM_API_KEY:
      process.env.CUSTOM_LLM_API_KEY || existingConfig.CUSTOM_LLM_API_KEY,
    CUSTOM_MODEL: process.env.CUSTOM_MODEL || existingConfig.CUSTOM_MODEL,
    PEXELS_API_KEY: process.env.PEXELS_API_KEY || existingConfig.PEXELS_API_KEY,
    PIXABAY_API_KEY:
      process.env.PIXABAY_API_KEY || existingConfig.PIXABAY_API_KEY,
    IMAGE_PROVIDER: process.env.IMAGE_PROVIDER || existingConfig.IMAGE_PROVIDER,
    TOOL_CALLS: process.env.TOOL_CALLS || existingConfig.TOOL_CALLS,
    DISABLE_THINKING: process.env.DISABLE_THINKING || existingConfig.DISABLE_THINKING,
    EXTENDED_REASONING: process.env.EXTENDED_REASONING || existingConfig.EXTENDED_REASONING,
    WEB_GROUNDING: process.env.WEB_GROUNDING || existingConfig.WEB_GROUNDING,
    USE_CUSTOM_URL: process.env.USE_CUSTOM_URL || existingConfig.USE_CUSTOM_URL,
  };


  writeFileSync(userConfigPath, JSON.stringify(userConfig));
}

const startServers = async () => {
  console.log(`🚀 Starting FastAPI server on port ${fastapiPort}...`);
  const fastApiProcess = spawn(
    "python",
    ["server.py", "--port", fastapiPort.toString(), "--reload", isDev],
    {
      cwd: fastapiDir,
      stdio: "inherit",
      env: process.env,
    },
  );

  fastApiProcess.on("error", (err) => {
    console.error("❌ FastAPI process failed to start:", err);
  });

  fastApiProcess.on("exit", (code, signal) => {
    console.error(`💥 FastAPI process exited with code ${code}, signal ${signal}`);
  });

  console.log(`🔧 Starting MCP server on port ${appmcpPort}...`);
  const appmcpProcess = spawn(
    "python",
    [
      "mcp_server.py",
      "--port",
      appmcpPort.toString(),
    ],
    {
      cwd: fastapiDir,
      stdio: "ignore",
      env: process.env,
    },
  );

  appmcpProcess.on("error", (err) => {
    console.error("❌ App MCP process failed to start:", err);
  });

  appmcpProcess.on("exit", (code, signal) => {
    console.error(`💥 MCP process exited with code ${code}, signal ${signal}`);
  });

  console.log(`⚛️  Starting Next.js server on port ${nextjsPort}...`);
  const nextjsProcess = spawn(
    "npm",
    ["run", isDev ? "dev" : "start", "--", "-p", nextjsPort.toString()],
    {
      cwd: nextjsDir,
      stdio: "inherit",
      env: process.env,
    },
  );

  nextjsProcess.on("error", (err) => {
    console.error("❌ Next.js process failed to start:", err);
  });

  nextjsProcess.on("exit", (code, signal) => {
    console.error(`💥 Next.js process exited with code ${code}, signal ${signal}`);
  });

  console.log("🦙 Starting Ollama service...");
  const ollamaProcess = spawn(
    "ollama",
    ["serve"],
    {
      cwd: "/",
      stdio: "inherit",
      env: process.env,
    }
  );

  ollamaProcess.on("error", err => {
    console.error("❌ Ollama process failed to start:", err);
  });

  ollamaProcess.on("exit", (code, signal) => {
    console.error(`💥 Ollama process exited with code ${code}, signal ${signal}`);
  });



  // Periodic heartbeat to confirm all processes are running
  const heartbeatInterval = setInterval(() => {
    const processes = [
      { name: "FastAPI", process: fastApiProcess },
      { name: "Next.js", process: nextjsProcess },
      { name: "Ollama", process: ollamaProcess },
      { name: "MCP", process: appmcpProcess }
    ];
    
    const runningProcesses = processes.filter(p => !p.process.killed && p.process.exitCode === null);
    console.log(`💓 Heartbeat: ${runningProcesses.length}/${processes.length} processes running (${runningProcesses.map(p => p.name).join(', ')})`);
    
    if (runningProcesses.length === 0) {
      console.error("❌ All processes have stopped!");
      clearInterval(heartbeatInterval);
    }
  }, 30000); // Log every 30 seconds

  console.log("✅ All services started successfully. Monitoring processes...");

  // Keep the Node process alive until any server exits
  const exitCode = await Promise.race([
    new Promise(resolve => fastApiProcess.on("exit", resolve)),
    new Promise(resolve => nextjsProcess.on("exit", resolve)),
    new Promise(resolve => ollamaProcess.on("exit", resolve)),
    new Promise(resolve => appmcpProcess.on("exit", resolve)),
  ]);

  clearInterval(heartbeatInterval);
  console.log(`💥 One of the processes exited. Exit code: ${exitCode}`);
  console.log("🛑 Shutting down all services...");
  process.exit(exitCode);
};

// Start nginx service
const startNginx = () => {
  console.log('🌐 Starting Nginx reverse proxy...');
  const nginxProcess = spawn('service', ['nginx', 'start'], {
    stdio: 'inherit',
    env: process.env,
  });

  nginxProcess.on('error', err => {
    console.error('❌ Nginx process failed to start:', err);
  });

  nginxProcess.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ Nginx started successfully');
    } else {
      console.error(`❌ Nginx failed to start with exit code: ${code}`);
    }
  });
};

if (isDev) {
  setupNodeModules();
}

console.log('🎯 Presenton application starting...');
console.log(`📍 Environment: ${isDev ? 'Development' : 'Production'}`);
console.log(`📂 App data directory: ${process.env.APP_DATA_DIRECTORY}`);

if (canChangeKeys) {
  console.log('⚙️  Setting up user configuration...');
  setupUserConfigFromEnv();
}

startServers();
startNginx();