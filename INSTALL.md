# 🚀 One-Click Installation

## Windows Docker Desktop

**Copy & Paste this ONE command in Docker Desktop Terminal:**

```powershell
git clone https://github.com/LuisPuertollano/openhands2.git; cd openhands2; docker compose up -d --build
```

**Then open:** http://localhost:45679

✅ Database is **persistent** (your data survives restarts!)

---

## Linux/Mac

**Copy & Paste this ONE command:**

```bash
git clone https://github.com/LuisPuertollano/openhands2.git && cd openhands2 && docker compose up -d --build
```

**Then open:** http://localhost:45679

✅ Database is **persistent** (your data survives restarts!)

---

## Alternative: Quick Start Script

### Windows
```batch
git clone https://github.com/LuisPuertollano/openhands2.git
cd openhands2
start.bat
```

### Linux/Mac
```bash
git clone https://github.com/LuisPuertollano/openhands2.git
cd openhands2
./start.sh
```

---

## What Gets Installed?

- ✅ PostgreSQL database (persistent storage)
- ✅ Node.js backend API
- ✅ React frontend dashboard
- ✅ 15 mock resources
- ✅ 3 sample projects
- ✅ 15 work packages (FMECA, Hazard Log, SIL, etc.)

**Total setup time:** 2-3 minutes (first run), 30 seconds (subsequent runs)

---

## Managing the System

### Stop (Keep Data)
```bash
docker compose stop
```

### Start Again
```bash
docker compose start
```

### View Logs
```bash
docker compose logs -f
```

### Complete Reset (Delete Data)
```bash
docker compose down -v
docker compose up -d --build
```

---

## Requirements

**Only Docker is needed!**

- **Windows:** Docker Desktop ([Download](https://docs.docker.com/desktop/install/windows-install/))
- **Mac:** Docker Desktop ([Download](https://docs.docker.com/desktop/install/mac-install/))
- **Linux:** Docker Engine ([Install Guide](https://docs.docker.com/engine/install/))

---

## Full Documentation

- **Windows Detailed Guide:** [WINDOWS_DOCKER_DESKTOP.md](WINDOWS_DOCKER_DESKTOP.md)
- **Quick Start:** [QUICK_START.md](QUICK_START.md)
- **Docker Guide:** [DOCKER_SETUP.md](DOCKER_SETUP.md)
- **Full README:** [README.md](README.md)

---

**Questions?** See [WINDOWS_DOCKER_DESKTOP.md](WINDOWS_DOCKER_DESKTOP.md) for troubleshooting.
