/**
 * PM2 process-manager config for bare-metal / VPS deployments.
 *
 *   npx pm2 start ecosystem.config.cjs
 *   npx pm2 save && npx pm2 startup
 *
 * `npm run build -w client` must be run at least once before start.
 */
module.exports = {
  apps: [
    {
      name: 'noir-salon',
      cwd: __dirname,
      script: 'server/server.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
      merge_logs: true,
      out_file: 'logs/pm2-out.log',
      error_file: 'logs/pm2-error.log',
      time: true,
    },
  ],
};