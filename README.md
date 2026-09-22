# Neighbor Link

Neighbor Link is a rental property management platform for tenants and administrators.

The project is designed to provide one shared foundation for rental operations while keeping the tenant portal and administrative portal as separate frontend applications.

## Project Goals

### Tenant portal

- View current rental and property information
- View lease and contract details
- Access relevant Wi-Fi information
- Receive rental fee and other payment requests
- Make payments and review payment history
- Submit complaints and feedback

### Administrative portal

- Manage tenants and properties
- Manage lease and contract information
- Create recurring rental fee charges
- Create one-time charges such as renewal fees or maintenance fees
- Review payment status and payment history
- Review and manage tenant complaints and feedback

## Current Status

The current version is an authentication base. It includes:

- Separate tenant and admin Next.js applications
- A shared Go backend service
- Role-aware login for `tenant` and `admin`
- SQLite persistence for authentication users
- bcrypt password hashing
- HttpOnly authentication cookies
- Next.js API route proxying to the Go backend
- Reusable frontend `useApi` request wrapper
- English and Chinese language support through global JSON message files
- Tailwind CSS 3
- Environment-based configuration

The post-login dashboards are intentionally empty placeholders. Rental, contract, billing, payment, complaint, and feedback features will be added in later iterations.

## Repository Structure

```text
neighbor-link/
├── admin/       # Administrative Next.js application
├── tenant/      # Tenant Next.js application
├── backend/     # Go API and SQLite persistence
├── .gitignore
└── README.md
```

## Technology Stack

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS 3
- Next.js route handlers as a frontend API boundary

### Backend

- Go
- `net/http`
- GORM
- SQLite
- bcrypt password hashing

## Local Development

### 1. Configure the backend

Copy `backend/.env.example` to `backend/.env` and set the values for your local environment. The backend loads this file automatically.

Example:

```env
DB_PATH=local.db
SERVER_ADDRESS=:8080
AUTH_SECRET=local-development-secret
ADMIN_PASSWORD=123456
TENANT_PASSWORD=123456
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

The example credentials are for local development only. Do not use them in a deployed environment.

### 2. Start the backend

From the repository root, run one command:

```powershell
go -C backend run ./cmd/server/main.go
```

The API is available at `http://localhost:8080`.

Health check:

```text
GET /health
```

Login endpoint:

```text
POST /api/v1/auth/login
```

### 3. Configure the frontend applications

Each frontend reads its own `.env.local` automatically. Create these files once if they do not already exist:

```powershell
Copy-Item tenant/.env.local.example tenant/.env.local
Copy-Item admin/.env.local.example admin/.env.local
```

Next.js automatically loads each `.env.local` file. No PowerShell `$env:` commands are required.

Each frontend uses the backend URL through its Next.js server-side API route:

```env
BACKEND_API_URL=http://localhost:8080
```

### 4. Start the tenant portal

Open a separate terminal and run one command:

```powershell
npm --prefix tenant run dev
```

Run `npm --prefix tenant install` once before the first start if dependencies have not been installed.

The tenant portal runs at `http://localhost:3000`.

### 5. Start the admin portal

Open another terminal and run one command:

```powershell
npm --prefix admin run dev -- --port 3001
```

Run `npm --prefix admin install` once before the first start if dependencies have not been installed.

The admin portal runs at `http://localhost:3001`.

## Development Accounts

The initial local development accounts are configured through backend environment variables:

| Role | Username | Default password |
| --- | --- | --- |
| Administrator | `admin` | `123456` |
| Tenant | `tenant` | `123456` |

## Frontend API Pattern

Frontend components do not call the Go backend directly. They call a local Next.js route through the reusable API wrapper:

```tsx
const api = useApi();

await api("/auth/login", {
  username,
  password,
  role: "tenant",
});
```

The request flow is:

```text
Frontend component
    -> useApi()
    -> Next.js route: /api/auth/login
    -> Go backend: /api/v1/auth/login
```

This boundary keeps backend URLs and server-side forwarding logic out of browser components and gives future API endpoints a consistent structure.

## Internationalization

Each frontend keeps its global language files in:

```text
messages/en.json
messages/zh.json
```

The current login base supports English and Chinese. Additional language keys can be added to these files as new screens are introduced.

## Validation

Run the current checks from the repository root:

```powershell
go -C backend test ./...
go -C backend build ./...
npm --prefix tenant run lint
npm --prefix tenant run build
npm --prefix admin run lint
npm --prefix admin run build
```

## Roadmap

- Add authenticated dashboard layouts
- Add tenant, property, and lease data models
- Add recurring and one-time billing
- Integrate a payment provider
- Add payment history and payment status workflows
- Add complaints and feedback management
- Add administrative tenant and property management
- Extract reusable validation, UI, API, authentication, and internationalization packages
- Create a reusable project template for future applications

## Security Notes

- Passwords are stored as bcrypt hashes, never as plaintext.
- Authentication tokens are delivered through HttpOnly cookies.
- The default credentials are development-only values.
- Before deployment, use strong environment values for passwords and `AUTH_SECRET`.
- Do not commit production secrets to the repository.
