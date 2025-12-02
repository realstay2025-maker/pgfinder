# Production Deployment Guide

## Prerequisites
- Docker & Docker Compose
- SSL certificates
- Domain name
- MongoDB Atlas or self-hosted MongoDB
- SMTP email service

## Quick Start

1. **Clone and configure**
```bash
git clone <repository-url>
cd project
cp .env.production .env
# Edit .env with your production values
```

2. **Deploy with Docker**
```bash
chmod +x deploy.sh
./deploy.sh
```

## Manual Deployment

1. **Environment Setup**
```bash
# Copy production environment
cp .env.production .env

# Update with your values:
# - MONGODB_URI
# - JWT_SECRET (32+ characters)
# - EMAIL_USER/EMAIL_PASS
# - CORS_ORIGIN (your domain)
```

2. **SSL Certificates**
```bash
# Place SSL certificates in ssl/ directory
mkdir ssl
# Copy your cert.pem and key.pem files
```

3. **Start Services**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring

- **Health Check**: `https://yourdomain.com/api/health`
- **Logs**: `docker-compose logs -f app`
- **Database**: Monitor MongoDB Atlas dashboard

## Backup Strategy

```bash
# Database backup
docker exec mongodb mongodump --uri="$MONGODB_URI" --out=/backup

# File backup
tar -czf uploads-backup.tar.gz uploads/
```

## Security Checklist

- ✅ HTTPS enabled
- ✅ Rate limiting active
- ✅ Input sanitization
- ✅ Security headers
- ✅ File upload restrictions
- ✅ Database indexes
- ✅ Error handling
- ✅ Logging enabled

## Performance Optimizations

- ✅ Database indexing
- ✅ Gzip compression
- ✅ Static file caching
- ✅ Bundle optimization
- ✅ Image optimization
- ✅ Connection pooling

## Troubleshooting

**Service won't start:**
```bash
docker-compose logs app
```

**Database connection issues:**
```bash
docker-compose exec app node -e "require('./src/config/database')()"
```

**SSL certificate issues:**
```bash
openssl x509 -in ssl/cert.pem -text -noout
```

## Scaling

For high traffic, consider:
- Load balancer (multiple app instances)
- Redis for session storage
- CDN for static files
- Database read replicas