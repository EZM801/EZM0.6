/**
 * PM2 ecosystem config for EZM0.5 on Amazon EC2.
 * Usage: pm2 start ecosystem.config.cjs
 *        pm2 save && pm2 startup  # persist across reboots
 */
module.exports = {
  apps: [
    {
      name: 'ezm',
      cwd: __dirname,
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '500M',
      error_file: './logs/pm2-err.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
