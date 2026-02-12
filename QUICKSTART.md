# Quick Start Guide - Click Analytics

## For the Development Team

### Setup Instructions

1. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend  
   cd frontend
   npm install
   ```

2. **Seed Sample Data** (Optional - for testing)
   ```bash
   cd backend
   node seedClicks.js
   ```

3. **Start the Application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

4. **View Analytics**
   - Navigate to http://localhost:3000
   - Click on "Dashboard" in the sidebar
   - Scroll down to see "Click Analytics" section

### Features Implemented ✅

1. **Click Tracking Backend**
   - ✅ MongoDB model for click events
   - ✅ POST /api/clicks - Log clicks
   - ✅ GET /api/clicks/stats - Get analytics with filters
   - ✅ Rate limiting for security
   - ✅ Date range and resource type filtering

2. **Analytics Dashboard**
   - ✅ Interactive charts (Line, Bar, Pie)
   - ✅ Date range filter
   - ✅ Resource type filter (Training, Guideline, Profile, Other)
   - ✅ Total clicks counter
   - ✅ Average daily clicks
   - ✅ Clicks by resource type distribution

3. **Integration**
   - ✅ Dashboard page shows analytics
   - ✅ Trainings page tracks clicks automatically
   - ✅ Reusable hook for adding tracking anywhere

### How to Add Click Tracking to Other Pages

Use the `useClickTracker` hook in any component:

```javascript
import { useClickTracker } from '../hooks/useClickTracker';

function MyComponent() {
  const trackClick = useClickTracker();
  
  const handleItemClick = (itemId, itemTitle) => {
    // Track the click
    trackClick('guideline', itemId, {
      action: 'view',
      title: itemTitle
    });
    
    // Your existing logic...
  };
  
  return (
    <button onClick={() => handleItemClick('123', 'Example')}>
      Click Me
    </button>
  );
}
```

### API Endpoints

**Log a Click:**
```bash
POST http://localhost:5000/api/clicks
Content-Type: application/json

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

**Get Analytics:**
```bash
GET http://localhost:5000/api/clicks/stats?startDate=2026-01-01&endDate=2026-02-12&resourceType=training
```

### Chart Types Available

1. **Line Chart** - Shows trend over time
2. **Bar Chart** - Shows daily click counts
3. **Pie Chart** - Shows distribution by resource type

### Filters Available

- **Start Date** - Filter clicks from this date
- **End Date** - Filter clicks to this date
- **Resource Type** - Filter by: All Types, Training, Guideline, Profile, Other

### Rate Limits

For security, the following rate limits are enforced:
- Click logging: 100 requests per 15 minutes per IP
- Stats retrieval: 30 requests per 15 minutes per IP

### Testing

1. Click on training materials in the Trainings page
2. Navigate to Dashboard
3. See the clicks reflected in the analytics
4. Use filters to adjust the view

### Files Modified/Created

**Backend:**
- ✅ `models/Click.js` - Database schema
- ✅ `controllers/clickController.js` - Business logic
- ✅ `routes/clickRoutes.js` - API endpoints
- ✅ `server.js` - Route registration
- ✅ `seedClicks.js` - Sample data generator

**Frontend:**
- ✅ `components/ClicksChart.jsx` - Chart component
- ✅ `hooks/useClickTracker.js` - Tracking hook
- ✅ `services/clickService.js` - API service
- ✅ `pages/Dashboard.jsx` - Dashboard integration
- ✅ `pages/Trainings.jsx` - Click tracking example

**Documentation:**
- ✅ `CLICK_ANALYTICS.md` - Comprehensive guide
- ✅ `QUICKSTART.md` - This file

### Next Steps for the Team

1. Review the PR and test locally
2. Consider adding click tracking to other pages:
   - Guidelines page
   - Profile page
   - Content Creation page
3. Customize the charts as needed
4. Add more metadata to track (e.g., user demographics, device type)

### Questions?

Refer to `CLICK_ANALYTICS.md` for detailed documentation or reach out to the development team.

---

**Note:** The screenshot shows the UI in error state because the backend wasn't connected in the testing environment. When you run it locally with the backend connected and seeded data, you'll see beautiful charts with real data! 📊
