# Click Analytics Feature

This document describes the click tracking and analytics feature implemented in the UGC application.

## Overview

The click tracking system logs user interactions across the application and provides visual analytics through an interactive dashboard with filterable charts.

## Backend Components

### 1. Click Model (`/backend/models/Click.js`)
Stores click events with the following structure:
```javascript
{
  userId: String,           // User identifier or 'anonymous'
  trainingId: ObjectId,     // Reference to Training (if applicable)
  resourceType: String,     // 'training', 'guideline', 'profile', or 'other'
  resourceId: String,       // ID of the clicked resource
  timestamp: Date,          // When the click occurred
  metadata: {
    page: String,           // Page where click occurred
    action: String,         // Action type (view, click, download, etc.)
    userAgent: String       // Browser info
  }
}
```

### 2. API Endpoints (`/backend/routes/clickRoutes.js`)

All endpoints include rate limiting for security:
- Click logging: 100 requests per 15 minutes per IP
- Stats retrieval: 30 requests per 15 minutes per IP

#### POST `/api/clicks`
Log a new click event.

**Request Body:**
```json
{
  "userId": "user123",
  "resourceType": "training",
  "resourceId": "abc123",
  "metadata": {
    "action": "view",
    "page": "/trainings"
  }
}
```

#### GET `/api/clicks/stats`
Get aggregated click statistics with filtering.

**Query Parameters:**
- `startDate` (optional): Filter clicks from this date (ISO 8601)
- `endDate` (optional): Filter clicks until this date (ISO 8601)
- `resourceType` (optional): Filter by resource type
- `trainingId` (optional): Filter by specific training

**Response:**
```json
{
  "totalClicks": 1234,
  "clicksByDay": [
    { "date": "2026-01-15", "count": 45 },
    { "date": "2026-01-16", "count": 52 }
  ],
  "clicksByType": [
    { "type": "training", "count": 800 },
    { "type": "guideline", "count": 300 }
  ]
}
```

#### GET `/api/clicks`
Get individual click records with filtering.

**Query Parameters:**
- `startDate` (optional): Filter clicks from this date
- `endDate` (optional): Filter clicks until this date
- `resourceType` (optional): Filter by resource type
- `limit` (optional): Max number of records (default: 100)

### 3. Seed Script (`/backend/seedClicks.js`)
Generates sample click data for the last 30 days for testing purposes.

**Usage:**
```bash
cd backend
node seedClicks.js
```

## Frontend Components

### 1. ClicksChart Component (`/frontend/src/components/ClicksChart.jsx`)
Interactive chart component with:
- Line and bar chart visualization
- Date range filters
- Resource type filters
- Total clicks counter
- Average daily clicks
- Pie chart showing clicks by resource type

### 2. Click Tracker Hook (`/frontend/src/hooks/useClickTracker.js`)
Convenient hook for tracking clicks throughout the application.

**Usage:**
```javascript
import { useClickTracker } from '../hooks/useClickTracker';

function MyComponent() {
  const trackClick = useClickTracker();
  
  const handleClick = (itemId) => {
    trackClick('training', itemId, {
      action: 'view',
      trainingTitle: 'Example Training'
    });
  };
}
```

### 3. Click Service (`/frontend/src/services/clickService.js`)
API service for click-related HTTP requests.

## Integration

The click tracking is integrated into:
- **Dashboard Page**: Displays the main analytics chart
- **Trainings Page**: Tracks when users view training materials

## Usage Guide

### For Developers

1. **Track a click event:**
```javascript
import { useClickTracker } from '../hooks/useClickTracker';

const trackClick = useClickTracker();

// Track a simple click
trackClick('guideline', guidelineId);

// Track with metadata
trackClick('training', trainingId, {
  action: 'download',
  customField: 'value'
});
```

2. **Add tracking to any component:**
```javascript
onClick={() => {
  trackClick('resourceType', resourceId, { action: 'click' });
  // ... your existing onClick logic
}}
```

### For Users

1. Navigate to the Dashboard page
2. View the "Click Analytics" section
3. Use filters to:
   - Select date range
   - Filter by resource type
   - Switch between line and bar charts
4. View detailed statistics:
   - Total clicks in selected period
   - Daily click trends
   - Distribution by resource type

## Database Indexes

The Click model includes optimized indexes for:
- Timestamp queries (descending)
- Resource type filtering
- Training ID lookups

## Future Enhancements

Potential improvements:
- User-specific analytics
- Export data to CSV/Excel
- Real-time updates with WebSockets
- Heatmap visualization
- Conversion tracking
- A/B testing support

## Testing

1. **Seed sample data:**
   ```bash
   cd backend
   node seedClicks.js
   ```

2. **Start the backend:**
   ```bash
   cd backend
   npm start
   ```

3. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

4. Navigate to the Dashboard to view analytics.

## Notes

- Click tracking fails silently to not disrupt user experience
- Anonymous users are tracked as 'anonymous'
- All timestamps are stored in UTC
- The system handles users without authentication gracefully
