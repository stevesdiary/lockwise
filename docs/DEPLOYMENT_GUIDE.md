# Lockwise Deployment Guide

## Prerequisites

### System Requirements
- Node.js 18+ 
- PostgreSQL 13+
- Redis 6+
- Docker (optional)

### External Services
- Google Maps API key (Geocoding API enabled)
- AWS S3 bucket for file storage
- SMTP server for email notifications

## Environment Configuration

### Production Environment Variables
```env
# Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@host:5432/lockwise_prod
DB_SSL=true

# Redis
REDIS_URL=redis://username:password@host:6379
REDIS_TLS=true

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=24h

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=lockwise-uploads

# Email (Brevo/SendGrid)
BREVO_API_KEY=your-brevo-api-key
FROM_EMAIL=noreply@yourdomain.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Security
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## Database Setup

### 1. Create Database
```sql
CREATE DATABASE lockwise_prod;
CREATE USER lockwise_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE lockwise_prod TO lockwise_user;
```

### 2. Run Migrations
```bash
npm run migrate
```

### 3. Seed Initial Data (Optional)
```bash
npm run seed
```

## Redis Configuration

### Basic Redis Setup
```bash
# Install Redis
sudo apt-get install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf

# Key settings:
maxmemory 256mb
maxmemory-policy allkeys-lru
requirepass your-redis-password
```

### Redis Clustering (High Availability)
```bash
# For production, consider Redis Cluster or Sentinel
redis-cli --cluster create \
  127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 \
  --cluster-replicas 1
```

## Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: lockwise_prod
      POSTGRES_USER: lockwise_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Deploy with Docker
```bash
# Build and start services
docker-compose up -d

# Run migrations
docker-compose exec app npm run migrate

# View logs
docker-compose logs -f app
```

## Cloud Deployment

### AWS Deployment

#### 1. EC2 Setup
```bash
# Launch EC2 instance (t3.medium recommended)
# Install dependencies
sudo apt update
sudo apt install nodejs npm postgresql-client redis-tools

# Clone repository
git clone https://github.com/your-org/lockwise.git
cd lockwise

# Install dependencies
npm ci --only=production

# Build application
npm run build
```

#### 2. RDS PostgreSQL
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier lockwise-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username lockwise \
  --master-user-password your-password \
  --allocated-storage 20
```

#### 3. ElastiCache Redis
```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id lockwise-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

#### 4. Application Load Balancer
```bash
# Create ALB for high availability
aws elbv2 create-load-balancer \
  --name lockwise-alb \
  --subnets subnet-12345 subnet-67890 \
  --security-groups sg-12345
```

### Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create lockwise-prod

# Add PostgreSQL and Redis
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set GOOGLE_MAPS_API_KEY=your-api-key

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate
```

## Process Management

### PM2 (Production Process Manager)
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'lockwise',
    script: './build/src/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

## Nginx Configuration

### Reverse Proxy Setup
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
    }
}
```

## Monitoring & Logging

### Application Monitoring
```bash
# Install monitoring tools
npm install --save express-prometheus-middleware
npm install --save winston

# Health check endpoint
GET /health
```

### Log Management
```javascript
// winston configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Security Checklist

### Production Security
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Set secure JWT secret (32+ characters)
- [ ] Configure CORS for specific domains
- [ ] Enable rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable database SSL connections
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities

### Database Security
```sql
-- Create read-only user for reporting
CREATE USER lockwise_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE lockwise_prod TO lockwise_readonly;
GRANT USAGE ON SCHEMA public TO lockwise_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO lockwise_readonly;
```

## Backup Strategy

### Database Backups
```bash
# Daily automated backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_BUCKET="your-backup-bucket-$(openssl rand -hex 8)"
pg_dump $DATABASE_URL > /backups/lockwise_$DATE.sql
aws s3 cp /backups/lockwise_$DATE.sql s3://$BACKUP_BUCKET/

# Retention: Keep 30 days
find /backups -name "lockwise_*.sql" -mtime +30 -delete
```

### Redis Backups
```bash
# Redis persistence configuration
save 900 1
save 300 10
save 60 10000

# Manual backup
redis-cli --rdb /backups/redis_backup.rdb
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (ALB, Nginx)
- Stateless application design
- Redis for session storage
- Database connection pooling

### Performance Optimization
- Enable gzip compression
- Use CDN for static assets
- Database query optimization
- Redis caching strategy
- Connection pooling

## Troubleshooting

### Common Issues
1. **Database Connection**: Check DATABASE_URL and network
2. **Redis Connection**: Verify REDIS_URL and authentication
3. **Memory Issues**: Monitor Node.js heap usage
4. **High CPU**: Check for infinite loops or heavy operations

### Debug Commands
```bash
# Check application logs
pm2 logs lockwise

# Monitor system resources
htop
iostat -x 1

# Database connections
SELECT * FROM pg_stat_activity;

# Redis info
redis-cli info
```

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Monitor disk space
- [ ] Review error logs weekly
- [ ] Database maintenance (VACUUM, ANALYZE)
- [ ] Security patches
- [ ] Performance monitoring

### Update Process
```bash
# 1. Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# 2. Update code
git pull origin main
npm ci --only=production

# 3. Run migrations
npm run migrate

# 4. Restart application
pm2 restart lockwise

# 5. Verify deployment
curl -f http://localhost:3000/health
```