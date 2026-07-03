# TaskFlow API

A secure, modular RESTful API built with **Node.js** and **Express** that serves as the backend service for the TaskFlow application. This project replaces client-side local storage with server-side processing, utilizing in-memory persistence, custom security middlewares, standard request loggers, and centralized error handling.

Crafted by **R. Goutham** as **Task 3** of the **SoftNexis Web Development Internship**.

---

## 📁 Project Structure

This project follows a modular architecture separating routes, controllers, and middlewares:

```text
taskflow-api/
├── server.js            # Entry point of the Express server
├── package.json         # NPM package dependencies and scripts
├── .env                 # Port and environment variables configuration
├── src/
│   ├── routes/          # API endpoint route registration
│   │   └── taskRoutes.js
│   ├── controllers/     # Task business logic & in-memory database
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
*   **Middlewares**:
    *   `cors`: Enables Cross-Origin Resource Sharing (allows frontends to communicate with this API).
    *   `morgan`: HTTP request logging middleware for monitoring API calls in the console.
    *   `helmet`: Sets secure HTTP headers to mitigate common web vulnerabilities.
    *   `dotenv`: Loads variables from the `.env` file into `process.env`.
*   **Security Headers (Custom)**: Custom middleware setting:
    *   `X-Content-Type-Options: nosniff`
    *   `X-Frame-Options: DENY`
    *   `Strict-Transport-Security: max-age=31536000; includeSubDomains`

---

## 🚀 Installation & Getting Started

Since this is your first time in development, follow these simple, step-by-step commands to get the server up and running on your local machine:

### 1. Open Terminal/Command Prompt
Open your preferred command-line tool (VS Code Terminal, Command Prompt, PowerShell, or Git Bash) and navigate to the project directory:
```cmd
cd C:\Users\user\.gemini\antigravity\scratch\taskflow-api
```

### 2. Install Dependencies
Run the npm install command to download and install all the libraries listed in the `package.json` file:
```cmd
npm install
```
*This will create a `node_modules` folder in your project directory containing the libraries.*

### 3. Running the Server
You can run the server in two modes:

#### Option A: Development/Start Mode (Standard)
Start the Express server using the NPM script:
```cmd
npm start
```
You should see the output:
```text
TaskFlow API running on port 5000
```
This means the API is running locally and listening for requests at `http://localhost:5000`.

---

## 🌐 API Endpoint Documentation

| Method | Endpoint | Request Body | Description | Expected Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/tasks` | None | Retrieve list of all tasks | `200 OK` |
| **GET** | `/api/tasks/:id` | None | Retrieve a single task by ID | `200 OK` (Found), `404 Not Found` |
| **POST** | `/api/tasks` | `{"text": "Task description"}` | Create a new task (auto-increments ID) | `201 Created`, `400 Bad Request` |
| **PUT** | `/api/tasks/:id` | `{"text": "Updated text", "completed": true}` | Update task text or status (or both) | `200 OK`, `400 Bad Request`, `404 Not Found` |
| **DELETE** | `/api/tasks/:id` | None | Permanently delete task by ID | `204 No Content`, `404 Not Found` |

---

## 🧪 Step-by-Step API Testing Guide (Postman)

To verify that your server is working correctly, test it using **Postman**:

### Step 1: Import the Test Collection
1. Launch **Postman**.
2. Click the **Import** button in the top-left corner of the Postman dashboard.
3. Select **Choose Files** and upload the pre-configured collection file:
   `C:\Users\user\.gemini\antigravity\scratch\taskflow-api\tests\TaskFlow_API.postman_collection.json`
4. Click **Import** to add the collection `TaskFlow API` to your workspace.

### Step 2: Run the Endpoint Requests
Ensure your Express server is running (`npm start`), then execute the following tests in order:

1.  **GET All Tasks (Initially Empty)**:
    *   Click on `Get All Tasks (Initially Empty)` and click **Send**.
    *   *Expected Response*: Status `200 OK`, Body: `[]` (empty array).
2.  **POST Create Task (Valid)**:
    *   Click on `Create Task (Valid)`. Notice the Body is set to:
        ```json
        {
          "text": "Learn Node.js and Express"
        }
        ```
    *   Click **Send**.
    *   *Expected Response*: Status `201 Created`, Body:
        ```json
        {
          "id": 1,
          "text": "Learn Node.js and Express",
          "completed": false,
          "createdAt": "2026-07-03T..."
        }
        ```
3.  **POST Create Task (Invalid - Empty Text)**:
    *   Click on `Create Task (Invalid - Empty Text)`. Click **Send**.
    *   *Expected Response*: Status `400 Bad Request`, Body: `{"error": "Task text is required"}`.
4.  **GET All Tasks (After Creation)**:
    *   Click on `Get All Tasks (After Creation)`. Click **Send**.
    *   *Expected Response*: Status `200 OK`, Body: Array containing 1 task (`[ { "id": 1, ... } ]`).
5.  **GET Single Task by ID**:
    *   Click on `Get Single Task by ID`. Click **Send**.
    *   *Expected Response*: Status `200 OK`, Body: the task object with ID 1.
6.  **GET Non-Existent Task by ID**:
    *   Click on `Get Non-Existent Task by ID` (queries ID 999). Click **Send**.
    *   *Expected Response*: Status `404 Not Found`, Body: `{"error": "Task not found"}`.
7.  **PUT Update Task (Valid)**:
    *   Click on `Update Task (Valid)`. Notice the Body is set to:
        ```json
        {
          "text": "Master Node.js, Express & security headers",
          "completed": true
        }
        ```
    *   Click **Send**.
    *   *Expected Response*: Status `200 OK`, Body: Shows updated text and `"completed": true`.
8.  **DELETE Task (Valid)**:
    *   Click on `Delete Task (Valid)`. Click **Send**.
    *   *Expected Response*: Status `204 No Content`, Body: *None* (Empty).
9.  **GET All Tasks (Verify Deletion)**:
    *   Go back to the first `Get All Tasks` and click **Send**.
    *   *Expected Response*: Status `200 OK`, Body: `[]` (empty, as the task was deleted).

---

## 📸 Taking Screenshots for Submission

As part of your SoftNexis submission deliverables, you need to capture screenshots proving the API works. For each request, capture:
1.  **The Request URL, Method, and Body** (in the top half of Postman).
2.  **The Response Body and Status Code** (in the bottom half of Postman, e.g., `201 Created` or `200 OK`).
3.  **The Server Terminal Log** (showing Morgan logger outputting `POST /api/tasks 201 ...` or `GET /api/tasks 200 ...`).

**Recommended Screenshots to take**:
*   `screenshot1_post_create.png`: Successful creation of task (Status `201 Created`).
*   `screenshot2_get_all.png`: Retrieve all tasks containing your created tasks (Status `200 OK`).
*   `screenshot3_put_update.png`: Successful update of task (Status `200 OK`).
*   `screenshot4_delete_task.png`: Successful deletion of task (Status `204 No Content`).
*   `screenshot5_validation_error.png`: Creating task with empty text (Status `400 Bad Request`).

Save these screenshots in a folder named `screenshots/` inside your project for submission.

---

## 🐙 Committing & Pushing to GitHub

Once verification is complete, save your code to GitHub:

1.  **Initialize Git**:
    ```cmd
    git init
    ```
2.  **Create a `.gitignore` file**:
    Create a file named `.gitignore` in your root folder and add `node_modules/` and `.env` so they are not tracked:
    ```text
    node_modules/
    .env
    ```
3.  **Add all files to stage**:
    ```cmd
    git add .
    ```
4.  **Commit the files**:
    ```cmd
    git commit -m "feat: implement TaskFlow REST API backend service"
    ```
5.  **Create repository on GitHub** (via GitHub website) and link it:
    ```cmd
    git branch -M main
    git remote add origin https://github.com/YOUR_GITHUB_USERNAME/taskflow-api.git
    ```
6.  **Push to GitHub**:
    ```cmd
    git push -u origin main
    ```
