# RealEstate Portfolio Backend

Express + MongoDB backend for the real estate portfolio.

## Requirements
- Node.js 18+
- MongoDB 5+

## Setup
1. Create a .env file with your settings (MONGODB_URI, JWT_SECRET, etc.)

2. Install packages:
   
   ```pwsh
   npm install
   ```

3. Run in dev mode:
   
   ```pwsh
   npm run dev
   ```

Server will start on http://localhost:5000

API docs (if installed): http://localhost:5000/api/docs

## Endpoints
- Auth
  - POST /api/auth/register
  - POST /api/auth/login
  - GET /api/auth/me (Bearer token)
  - PUT /api/auth/updatepassword (Bearer token)

- Properties
  - GET /api/properties?flat=true
  - GET /api/properties/:id
  - POST /api/properties (Bearer token: admin|agent)
  - PUT /api/properties/:id (Bearer token: owner|admin)
  - DELETE /api/properties/:id (Bearer token: owner|admin)
  - PUT /api/properties/:id/images (multipart form-data, field: images)

- Content
  - GET /api/content?flat=true
  - GET /api/content/:id
  - POST /api/content (Bearer token: admin|agent)
  - PUT /api/content/:id (Bearer token: owner|admin)
  - DELETE /api/content/:id (Bearer token: owner|admin)
  - PUT /api/content/:id/like

- Settings
  - GET /api/settings
  - PUT /api/settings (Bearer token: admin|agent)
  - POST /api/settings (Bearer token: admin|agent)

- Health
  - GET /api/health

## Notes
- Use query param `flat=true` to get arrays for list endpoints (handy for frontend hooks expecting arrays).
- File uploads are served from `/uploads`.
- Security middlewares enabled: helmet, rate-limit, mongo-sanitize, xss-clean, hpp, cors, compression, morgan logging.

## Production
- Set `NODE_ENV=production` and provide strong `JWT_SECRET`.
- Run behind a reverse proxy (NGINX) and terminate TLS there.
- Consider PM2 for process management.

 
