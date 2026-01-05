module.exports = {
  apps: [
    {
      name: 'wladmin-backend',
      script: './index.js',
      cwd: '/opt/wladmin/server',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        MONGODB_URI: 'mongodb://localhost:27017/wladmin'
      },
      error_file: '/opt/wladmin/logs/backend-error.log',
      out_file: '/opt/wladmin/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
}
