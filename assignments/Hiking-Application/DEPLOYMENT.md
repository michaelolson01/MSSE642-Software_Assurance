# Docker Deployment Guide

## Prerequisites
- Docker (v20.10+)
- Docker Compose (v1.29+)

## Development Deployment

### 1. Build and Start Containers

```bash
docker-compose up --build
```

This will:
- Build the backend image
- Build the frontend image
- Start MySQL database
- Start backend API server
- Start frontend web server

### 2. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Database**: localhost:3306

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### 4. Stop Containers

```bash
docker-compose down
```

### 5. Remove Everything (including volumes)

```bash
docker-compose down -v
```

---

## Production Deployment

### 1. Create Production Environment File

```bash
cp .env.docker .env.prod
# Edit .env.prod with production values
```

### 2. Build and Start with Production Config

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### 3. Monitor Services

```bash
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Update Services

```bash
# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## Database Management

### Initialize Database

The schema is automatically initialized when the MySQL container starts.

### Backup Database

```bash
docker-compose exec db mysqldump -u app_user -ppassword trip_app > backup.sql
```

### Restore Database

```bash
docker-compose exec -T db mysql -u app_user -ppassword trip_app < backup.sql
```

---

## Firewall Configuration (VM Deployment)

### Allow Only Web Server Traffic to Database

```bash
# On the VM hosting the database container
sudo iptables -A INPUT -p tcp --dport 3306 -s <backend-container-ip> -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3306 -j DROP
```

Or use Docker networks (recommended):
- Services communicate via internal Docker network
- Only expose ports explicitly in docker-compose.yml
- Database is not exposed to host network

---

## Health Checks

Each service has health checks configured:

```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:3000/health
curl http://localhost:3001/
```

---

## Troubleshooting

### Backend can't connect to database

```bash
# Check if db container is running
docker-compose ps db

# Check db logs
docker-compose logs db

# Test connection from backend
docker-compose exec backend node test-db.js
```

### Frontend can't reach backend

```bash
# Check backend is running
docker-compose ps backend

# Check backend logs
docker-compose logs backend

# Verify CORS configuration
curl -H "Origin: http://localhost:3001" http://localhost:3000/health
```

### Port already in use

```bash
# Find process using port
lsof -i :3000
lsof -i :3001
lsof -i :3306

# Kill process
kill -9 <PID>
```

---

## Security Notes

1. **Change default passwords** in production
2. **Use strong JWT_SECRET** - generate with: `openssl rand -base64 32`
3. **Database is isolated** to Docker network (not exposed to host)
4. **Frontend served via Nginx** with security headers
5. **Health checks** ensure services are running properly
6. **Restart policies** ensure automatic recovery

---

## VM Deployment Steps

1. Install Docker and Docker Compose on VM
2. Clone repository to VM
3. Create `.env.prod` with production values
4. Run: `docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d`
5. Verify: `docker-compose -f docker-compose.prod.yml ps`
6. Access via VM IP: `http://<vm-ip>:3001`
