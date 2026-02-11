# MongoDB Connection Project

## Overview
This project demonstrates how to connect to a MongoDB database using Node.js and TypeScript. It includes a simple application structure that initializes a connection to MongoDB and provides a basic setup for managing data models.

## Project Structure
```
mongo-connect-project
├── src
│   ├── app.ts           # Entry point of the application
│   ├── db
│   │   └── mongodb.ts   # MongoDB connection logic
│   └── types
│       └── index.ts     # Data model interfaces
├── scripts
│   └── connect.sh       # Shell script to connect to MongoDB
├── .env.example         # Example environment variables
├── package.json         # npm configuration file
├── tsconfig.json        # TypeScript configuration file
└── README.md            # Project documentation
```

## Prerequisites
- Node.js (version 14 or higher)
- MongoDB (either locally installed or a cloud instance)
- npm (Node Package Manager)

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd mongo-connect-project
   ```

2. **Install Dependencies**
   Run the following command to install the required packages:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Copy the `.env.example` file to `.env` and update the `MONGODB_URI` with your MongoDB connection string.
   this link = MONGO_URI=mongodb+srv://Training:ugc1212@cluster0.ttgmlli.mongodb.net/?appName=Cluster0

   ```bash
   cp .env.example .env
   ```

4. **Run the Application**
   You can run the application using the provided shell script:
   ```bash
   ./scripts/connect.sh
   ```

## Connecting to MongoDB
The connection logic is implemented in `src/db/mongodb.ts`. The `connectToDatabase` function establishes a connection to the MongoDB database and handles any connection errors. 

Make sure to check the console for any connection messages or errors when running the application.

## License
This project is licensed under the MIT License.