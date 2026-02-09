# UGC Project with MDH Marketing Team

## Overview

User-Generated Content (UGC) management platform for MDH marketing campaigns. This project includes a backend service for managing content creation guidelines that marketing managers can create and content creators can access.

## Development Rules

1. Never push to the main branch
2. Create your own branch (use your name for the branch)
3. Keep your local code updated (all the time)
4. When you push your code, create a pull request and ask one of the team members to review it

## Key Roles

1. May is the product owner
2. Deepsika is the Scrum Master

## Guideline Backend Service

### Features

- Create, read, update, and delete guidelines
- Categorize guidelines for better organization
- RESTful API for frontend integration
- PostgreSQL database for data persistence
- Soft delete functionality to maintain data history

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ugc_db
DB_USER=postgres
DB_PASSWORD=your_password
```

3. Create the database and run the schema:
```bash
psql -U postgres -c "CREATE DATABASE ugc_db;"
psql -U postgres -d ugc_db -f src/models/schema.sql
```

### Running the Service

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will be available at `http://localhost:3000`

### API Endpoints

#### Get all guidelines
```
GET /api/guidelines
```

#### Get guideline by ID
```
GET /api/guidelines/:id
```

#### Get guidelines by category
```
GET /api/guidelines/category/:category
```

#### Create new guideline
```
POST /api/guidelines
Content-Type: application/json

{
  "title": "Content Posting Guidelines",
  "content": "Always tag MDH in your posts...",
  "category": "social-media",
  "created_by": "marketing_manager"
}
```

#### Update guideline
```
PUT /api/guidelines/:id
Content-Type: application/json

{
  "title": "Updated Guidelines",
  "content": "New content...",
  "category": "social-media"
}
```

#### Delete guideline
```
DELETE /api/guidelines/:id
```

### Response Format

Success response:
```json
{
  "success": true,
  "data": { ... }
}
```

Error response:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

### Project Structure

```
├── src/
│   ├── config/
│   │   └── database.js       # Database configuration
│   ├── controllers/
│   │   └── guidelineController.js  # Business logic
│   ├── models/
│   │   ├── Guideline.js      # Guideline model
│   │   └── schema.sql        # Database schema
│   ├── routes/
│   │   └── guidelines.js     # API routes
│   └── index.js              # Application entry point
├── .env.example              # Environment variables template
├── .gitignore
├── package.json
└── README.md
```