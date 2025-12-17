# Port Change - Important Update

## 🔄 Default Ports Changed

**Date:** $(date)

### New Default Ports

| Service | Old Port | New Port | Reason |
|---------|----------|----------|--------|
| Backend API | 3000 | **45678** | Avoid conflicts with Node.js, React, and other dev servers |
| Frontend | 3001 | **45679** | Avoid conflicts with React, Next.js, and other dev servers |
| PostgreSQL | 5432 | 5432 | Unchanged (standard PostgreSQL port) |

### Why This Change?

**Problem:** Users frequently encountered errors like:
```
Error: Bind for 0.0.0.0:3000 failed: port is already allocated
```

Port 3000 and 3001 are **extremely common** default ports for:
- Node.js applications
- React development servers
- Create React App
- Next.js
- Angular CLI
- Vue CLI
- Express servers
- Many other development tools

**Solution:** Use high port numbers (45678, 45679) which are:
- ✅ Rarely used by other applications
- ✅ In the user port range (above 1024)
- ✅ Not reserved for system services
- ✅ Easy to remember (sequential numbers)
- ✅ Allow multiple projects to run simultaneously

### Impact

**For New Users:**
- No impact - just use the new ports
- System will work out of the box
- No port conflicts

**For Existing Users:**
- Stop your containers: `docker compose down`
- Pull latest changes: `git pull origin main`
- Restart containers: `docker compose up -d --build`
- Access frontend at: http://localhost:45679 (new)
- Access backend at: http://localhost:45678 (new)

### Reverting to Old Ports (3000/3001)

If you prefer the old ports, create a `.env` file:

```env
BACKEND_PORT=3000
FRONTEND_PORT=3001
```

Then restart:
```bash
docker compose down
docker compose up -d --build
```

### How to Change to Custom Ports

Create or edit `.env` file:

```env
POSTGRES_PORT=5432
BACKEND_PORT=8080
FRONTEND_PORT=8081
```

Then restart:
```bash
docker compose down
docker compose up -d --build
```

Access at: http://localhost:8081

### Documentation Updated

All documentation files have been updated to reflect the new default ports:
- ✅ README.md
- ✅ INSTALL.md
- ✅ QUICK_START.md
- ✅ WINDOWS_DOCKER_DESKTOP.md
- ✅ ONE_CLICK_INSTALL.md
- ✅ PORT_CONFIGURATION.md
- ✅ DOCKER_SETUP.md
- ✅ ARCHITECTURE.md
- ✅ PROJECT_SUMMARY.md
- ✅ docker-compose.yml
- ✅ start.sh
- ✅ start.bat
- ✅ .env.example

### Support

If you have any issues with the new ports:

1. **Check if ports are available:**
   ```bash
   # Linux/Mac
   lsof -i :45678
   lsof -i :45679
   
   # Windows
   netstat -ano | findstr :45678
   netstat -ano | findstr :45679
   ```

2. **Choose different ports:**
   ```bash
   ./start.sh          # Interactive port selection
   ```

3. **Or create .env file** with custom ports (see above)

For more details, see [PORT_CONFIGURATION.md](PORT_CONFIGURATION.md).

### Benefits Summary

✅ **No more "port already allocated" errors** for most users  
✅ **Smooth installation experience** out of the box  
✅ **Run multiple projects** simultaneously without conflicts  
✅ **Professional port allocation** in high port range  
✅ **Still fully configurable** via .env file  
✅ **Automatic port conflict detection** still works  

### Quick Reference

**New Access URLs:**
- Frontend: http://localhost:45679
- Backend API: http://localhost:45678
- Database: localhost:5432

**Old Access URLs (deprecated):**
- ~~Frontend: http://localhost:3001~~
- ~~Backend API: http://localhost:3000~~

Use `.env` file if you need to use old ports or custom ports.
