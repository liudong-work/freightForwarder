module.exports = {
  apps: [
    {
      name: 'wladmin-api',
      script: './backend/index.js',
      cwd: '/opt/wladmin',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        MONGODB_URI: 'mongodb://localhost:27017/wladmin'
      },
      error_file: '/opt/wladmin/logs/api-error.log',
      out_file: '/opt/wladmin/logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    },
    {
      name: 'wladmin-frontend',
      script: 'npx',
      args: 'serve -s frontend -l 3004',
      cwd: '/opt/wladmin',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3004
      },
      error_file: '/opt/wladmin/logs/frontend-error.log',
      out_file: '/opt/wladmin/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false
    }
  ]
}
