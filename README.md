# Keyword Research Platform

A keyword research automation platform with Google Ads Keyword Planner integration.

## Features

- **Project management** — Create and manage keyword research projects
- **Keyword import** — Paste keywords or upload CSV files (with PapaParse)
- **Google Ads integration** — OAuth 2.0 account connection, real historical metrics via Keyword Planner API
- **Batch processing** — Configurable batch size with progress tracking, pause/resume, retry failed
- **Metrics results** — Sortable/filterable table with monthly search history, competition level, bid ranges
- **Firebase Authentication** — Email/password + Google sign-in
- **MongoDB** — Mongoose ODM with atomic locks for batch concurrency

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB Atlas + Mongoose 9
- **Auth**: Firebase Authentication (client) + Firebase Admin (server)
- **API**: Google Ads REST API (v18)
- **Validation**: Zod 4
- **Forms**: react-hook-form

## Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Firebase project (Authentication enabled)
- Google Ads API access (developer token + OAuth 2.0 credentials)

## Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`. See `.env.example` for descriptions.

### Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase client config (from Firebase console) |
| `FIREBASE_PROJECT_ID` | Firebase Admin project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin private key (keep `\n` escapes) |
| `GOOGLE_ADS_CLIENT_ID` | OAuth 2.0 client ID from Google Cloud Console |
| `GOOGLE_ADS_CLIENT_SECRET` | OAuth 2.0 client secret |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Google Ads API developer token |
| `GOOGLE_ADS_REDIRECT_URI` | OAuth callback URL (default: `http://localhost:3000/api/google-ads/oauth/callback`) |
| `GOOGLE_ADS_CREDENTIAL_ENCRYPTION_KEY` | 64-char hex key for AES-256-GCM encryption of refresh tokens |
| `GOOGLE_ADS_API_VERSION` | API version (default: `v18`) |
| `GOOGLE_ADS_KEYWORD_BATCH_SIZE` | Keywords per batch (default: `50`, min: `10`, max: `50`) |
| `GOOGLE_ADS_MANAGER_ACCOUNT_ID` | Optional manager (MCC) account ID |

Generate an encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
keyword-research-platform/
├── app/
│   ├── api/                          # API routes
│   │   ├── auth/verify/              # Firebase token verification
│   │   ├── google-ads/               # Google Ads OAuth + connection
│   │   ├── metrics/                  # Batch processing endpoints
│   │   └── projects/                 # Project CRUD + keywords
│   ├── dashboard/                    # Dashboard pages
│   │   ├── projects/                 # Project list, detail, create
│   │   └── settings/google-ads/      # Google Ads connection settings
│   └── login/                        # Login page
├── components/                       # Shared React components
│   ├── GoogleAdsSettings.js          # OAuth connect + customer selection
│   ├── KeywordImport.js              # Paste/CSV keyword import
│   ├── KeywordResultsTable.js        # Results table + monthly history
│   └── MetricsProgress.js            # Batch processing progress
├── lib/
│   ├── auth.js                       # Firebase Admin token verification
│   ├── firebase.js                   # Firebase client (lazy-init)
│   ├── firebase-admin.js             # Firebase Admin (lazy-init)
│   ├── mongodb.js                    # Mongoose connection
│   ├── google-ads/                   # Google Ads API integration
│   │   ├── client.js                 # REST API client
│   │   ├── config.js                 # Centralized config
│   │   ├── customer-service.js       # Customer discovery
│   │   ├── error-mapper.js           # Error classification
│   │   ├── historical-metrics-service.js  # Keyword metrics API
│   │   ├── oauth.js                  # OAuth 2.0 flow
│   │   └── targeting-map.js          # Country/language mappings
│   └── security/
│       └── encryption.js             # AES-256-GCM encrypt/decrypt
├── models/                           # Mongoose schemas
│   ├── GoogleAdsConnection.js
│   ├── Job.js
│   ├── Keyword.js
│   ├── KeywordMetric.js
│   ├── KeywordProject.js
│   └── User.js
├── services/
│   ├── google-ads-connection.service.js  # Connection management
│   └── keyword-metrics.service.js        # Batch metrics processing
└── utils/
    ├── countries.js
    └── keywordNormalization.js
```

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/verify` | Verify Firebase ID token |
| GET/POST | `/api/projects` | List/create projects |
| GET/PUT/DELETE | `/api/projects/[id]` | Get/update/delete project |
| POST | `/api/projects/[id]/keywords` | Import keywords to project |
| GET | `/api/projects/[id]/metrics` | Get metrics for project |
| GET | `/api/google-ads/connection` | Get current connection status |
| POST | `/api/google-ads/oauth/start` | Initiate OAuth flow |
| GET | `/api/google-ads/oauth/callback` | OAuth callback handler |
| GET | `/api/google-ads/customers` | List accessible customers |
| POST | `/api/google-ads/customers/select` | Select active customer |
| DELETE | `/api/google-ads/connection/disconnect` | Disconnect Google Ads |
| POST | `/api/metrics/start` | Start metrics processing run |
| POST | `/api/metrics/batch` | Process next batch of keywords |
| GET | `/api/metrics/status` | Get current processing status |
| POST | `/api/metrics/pause` | Pause processing |
| POST | `/api/metrics/resume` | Resume processing |

## Google Ads Setup

1. Enable the Google Ads API in [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials (Web Application type)
3. Add `http://localhost:3000/api/google-ads/oauth/callback` as authorized redirect URI
4. Apply for a [developer token](https://developers.google.com/google-ads/api/docs/developer-token)
5. For manager (MCC) accounts, set `GOOGLE_ADS_MANAGER_ACCOUNT_ID`

## License

Private
