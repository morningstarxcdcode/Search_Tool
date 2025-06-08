module.exports = {
  apps: [
    {
      name: 'backend-api',
      script: './venv/bin/python',
      args: '-m uvicorn run:app --host 0.0.0.0 --port 8000',
      cwd: './backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      restart_delay: 4000,
      min_uptime: '10s',
      max_restarts: 10,
      env: {
        PYTHONPATH: './backend'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log'
    },
    {
      name: 'frontend-nextjs',
      script: 'npm',
      args: 'run dev',
      cwd: './frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      restart_delay: 4000,
      min_uptime: '10s',
      max_restarts: 10,
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log'
    }
  ]
}; 