import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  searchTasks
} from '../controllers/taskController.js';

const router = Router();

// ==========================================
// Specialized Routes
// ==========================================

// GET /api/tasks/search - Search tasks using keyword queries.
// IMPORTANT: This route must be declared BEFORE '/:id' to avoid conflicts where
// Express interprets the word 'search' as a task ID parameter.
router.get('/search', searchTasks);

// ==========================================
// Standard REST Endpoints
// ==========================================

router.route('/')
  // GET /api/tasks - Retrieve all tasks (optionally supports query params: page, limit)
  .get(getTasks)
  // POST /api/tasks - Create a new task in the database
  .post(createTask);

router.route('/:id')
  // GET /api/tasks/:id - Retrieve a single task by its database ID
  .get(getTaskById)
  // PUT /api/tasks/:id - Update text or completion status of an existing task
  .put(updateTask)
  // DELETE /api/tasks/:id - Permanently remove a task from the database
  .delete(deleteTask);

export default router;
