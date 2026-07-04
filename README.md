# TaskFlow DB

A production-grade, secure RESTful API built with **Node.js** and **Express**, featuring cloud database persistence via **MongoDB Atlas** and **Mongoose ODM**. This project is the database integration phase (Task 4) of the TaskFlow application, transitioning from an in-memory data store to a scalable NoSQL persistent storage.

Crafted by **R. Goutham** as **Task 4** of the **SoftNexis Web Development Internship**.

---

## 📁 Project Structure

```text
taskflow-api/
├── server.js            # Entry point of the Express server (starts DB & listens)
├── package.json         # NPM package dependencies and scripts
├── .env                 # Environment variables configuration (.env file)
├── src/
│   ├── db/              # Database connection configuration
│   │   └── connect.js
│   ├── models/          # Mongoose database models & schemas
│   │   └── Task.js
│   ├── routes/          # API endpoint route registration
│   │   └── taskRoutes.js
│   ├── controllers/     # Task business logic & MongoDB Atlas queries
│   │   └── taskController.js
│   ├── middleware/      # Custom middlewares (e.g. security headers)
│   │   └── security.js
│   └── utils/           # Utility files directory (reserved)
│       └── README.md
└── tests/
    └── TaskFlow_API.postman_collection.json  # Postman test collection
```

---

## 🛠️ Technology Stack & Dependencies

*   **Runtime Environment**: Node.js (v20+ recommended)
*   **Web Framework**: Express.js (v4.19.2)
*   **Object Modeling ODM**: Mongoose (v8.4.1)
*   **Database**: MongoDB Atlas (Cloud NoSQL Database)
*   **Middlewares**:
    *   `cors`: Enables Cross-Origin Resource Sharing.
    *   `morgan`: HTTP request logging middleware for monitoring API calls in the console.
    *   `helmet`: Sets secure HTTP headers to mitigate common web vulnerabilities.
    *   `dotenv`: Loads variables from the `.env` file into `process.env`.
*   **Custom Security Headers**: Enforces clickjacking protection (`X-Frame-Options: DENY`), MIME-sniffing prevention (`X-Content-Type-Options: nosniff`), and strict HTTPS transport (`Strict-Transport-Security`).

---

## 🚀 Setup & Installation Guide

Since this is the database integration phase, follow these instructions step-by-step to set up your cloud database and run the server.

### Phase 1: MongoDB Atlas Setup
1.  **Sign Up / Log In**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register for a free account.
2.  **Create a Cluster**:
    *   Click **Deploy a Database**.
    *   Choose the **M0 FREE** shared tier.
    *   Select your preferred cloud provider (e.g., AWS) and region, then click **Create**.
3.  **Configure Security (Database User)**:
    *   In the security setup wizard, create a database user.
    *   Enter a **Username** and a secure **Password**. Save these credentials safely.
    *   Set the user role privileges to **Read and write to any database**.
4.  **Configure Network Access (IP Whitelist)**:
    *   Navigate to **Security → Network Access** in the Atlas sidebar.
    *   Click **Add IP Address**.
    *   For development testing, choose **Allow Access From Anywhere** (IP: `0.0.0.0/0`) or click **Add Current IP Address** to whitelist your local machine.
    *   Click **Confirm**.
5.  **Get your Connection String**:
    *   Go to **Deployment → Database** in the sidebar.
    *   Click the **Connect** button next to your cluster.
    *   Select **Drivers** (Node.js).
    *   Copy the connection string (URI). It will look like this:
        `mongodb+srv://<username>:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

---

### Phase 2: Configuration and Launch

#### 1. Navigate to the project directory:
```cmd
cd C:\Users\user\.gemini\antigravity\scratch\taskflow-api
```

#### 2. Install dependencies:
```cmd
npm install
```
*This downloads the Mongoose and MongoDB drivers required to talk to the cloud cluster.*

#### 3. Update your `.env` file:
Open the `.env` file in the root folder and configure your values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://YOUR_DB_USERNAME:YOUR_DB_PASSWORD@cluster0.abc123.mongodb.net/taskflow?retryWrites=true&w=majority
```
> [!IMPORTANT]
> Make sure to replace `YOUR_DB_USERNAME` and `YOUR_DB_PASSWORD` with the database credentials you created in Phase 1, Step 3. Ensure the database name is specified in the path (e.g., `/taskflow?retryWrites...`).

#### 4. Run the server:
```cmd
npm start
```
Upon a successful connection, you will see the logs:
```text
MongoDB Connected: cluster0-shard-00-01.abc123.mongodb.net
TaskFlow API running on port 5000
```
If your URI is incorrect, the server will log `Database Error` and terminate immediately to avoid hanging threads.

---

## 🌐 API Endpoint Documentation

| Method | Endpoint | Request Body | Description | Expected Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/tasks` | None | Retrieve all tasks sorted by newest first | `200 OK` |
| **GET** | `/api/tasks?page=1&limit=5` | None | Retrieve tasks with pagination metadata | `200 OK` |
| **GET** | `/api/tasks/search?q=query` | None | Search tasks by keywords (text indexed) | `200 OK`, `400 Bad Request` |
| **GET** | `/api/tasks/:id` | None | Retrieve a single task by its database ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| **POST** | `/api/tasks` | `{"text": "Task text"}` | Create a task (Mongoose validation rules apply) | `201 Created`, `400 Bad Request` |
| **PUT** | `/api/tasks/:id` | `{"text": "Updated text", "completed": true}` | Update task text or status (or both) | `200 OK`, `400 Bad Request`, `404 Not Found` |
| **DELETE** | `/api/tasks/:id` | None | Permanently delete task by database ID | `204 No Content`, `404 Not Found` |

---

## 🧪 Testing with Postman

1. Open **Postman**.
2. Click **Import** (top left) and select the collection file:
   `C:\Users\user\.gemini\antigravity\scratch\taskflow-api\tests\TaskFlow_API.postman_collection.json`
3. Click **Import** to add it to your workspace.
4. Execute the requests in the collection folder to verify:
   *   **GET All Tasks (Initially Empty)**: Verifies connection.
   *   **POST Create Task 1, 2, 3**: Verifies creation, validates character limits (min length 3, max length 255), and sets database defaults.
   *   **Create Task (Invalid - Too Short)**: Attempts text validation failure (returns `400 Bad Request`).
   *   **Get Paginated Tasks**: Hitting `GET /api/tasks?page=1&limit=2`. Checks for `tasks` array, `totalPages`, and `currentPage`.
   *   **Search Tasks**: Hitting `GET /api/tasks/search?q=MongoDB`. Verifies text-indexing searches.
   *   **Get Single Task by ID**: Verifies search by dynamic parameter ID.
   *   **Update Task (Valid)**: Modifies properties, checks schema validation, and verifies `lastModified` gets automatically updated.
   *   **Delete Task**: Deletes the task from MongoDB.
   *   **Get Single Task (After Delete)**: Verifies it now returns `404 Not Found`.
