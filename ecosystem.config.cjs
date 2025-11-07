module.exports = {
  apps: [
    {
      name: "woori-frontend",
      cwd: __dirname,
      script: "npm",
      args: "run preview -- --host 0.0.0.0 --port 4173",
      exec_mode: "fork",
      instances: 1,
      watch: false,
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: "4173",
      },
      env_production: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: "4173",
      },
      error_file: "logs/pm2-frontend-err.log",
      out_file: "logs/pm2-frontend-out.log",
      merge_logs: true,
    },
  ],
};
