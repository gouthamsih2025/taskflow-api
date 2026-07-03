import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';

const router = Router();

// Routes mapping for the base URL: /api/tasks
router.route('/')
  // GET /api/tasks - Retrieve all tasks
  .get(getTasks)
  // POST /api/tasks - Create a new task
  .post(createTask);

// Routes mapping for tasks with specific IDs: /api/tasks/:id
router.route('/:id')
  // GET /api/tasks/:id - Retrieve a single task by ID
  .get(getTaskById)
  // PUT /api/tasks/:id - Update an existing task by ID
  .put(updateTask)
  // DELETE /api/tasks/:id - Delete a task by ID
  .delete(deleteTask);

export default router;
