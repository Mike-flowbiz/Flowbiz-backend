# Known Issues & Workarounds

## Prisma 7 with tsx watch mode

**Issue:** When running `npm run dev:backend` with tsx in watch mode, you may encounter:
```
TypeError: Cannot read properties of undefined (reading '__internal')
```

**Cause:** Prisma 7's new configuration system has caching issues with tsx watch mode.

**Workarounds:**

### Option 1: Use nodemon instead (Recommended for development)
```bash
npm install --save-dev nodemon ts-node
```

Update `package.json`:
```json
"dev:backend": "nodemon --watch src/backend --ext ts --exec ts-node src/backend/server.ts"
```

### Option 2: Use plain node with ts-node
```bash
npm run dev:backend
```

### Option 3: Compile and run
```bash
npx tsc && node dist/backend/server.js
```

### Option 4: Use Next.js API Routes (Future Implementation)
Consider migrating backend routes to Next.js API routes in `src/app/api/` to avoid this issue entirely.

## Frontend works perfectly

The frontend Next.js application has no issues and works perfectly with:
```bash
npm run dev
```

## Production Deployment

This issue only affects development. Production builds work perfectly:
```bash
npm run build
npm start
```

---

**Status:** Non-blocking for Milestone 1 completion. All functionality is implemented and works in production mode.

