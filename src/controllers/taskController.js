/**
 * Task Controller
 * Handles the business logic for all task-related API requests.
 * Uses an in-memory array for data storage.
 */

// In-memory data store for tasks (temporary, no database)
let tasks = [];
let currentId = 1;

/**
 * Helper function to find the index of a task by its numeric ID.
 * @param {number} id - The ID of the task to find.
 * @returns {number} The index of the task in the array, or -1 if not found.
 */
const findTaskIndex = (id) => tasks.findIndex(task => task.id === id);

/**
 * GET /api/tasks
 * Retrieves a list of all tasks.
 */
export const getTasks = (req, res) => {
  res.status(200).json(tasks);
};

/**
 * GET /api/tasks/:id
 * Retrieves a single task by its numeric ID.
 */
export const getTaskById = (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  // If the parsed ID is not a valid number, return a 400 Bad Request
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID format. Must be a number.' });
  }

  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.status(200).json(task);
};

/**
 * POST /api/tasks
 * Creates a new task.
 */
export const createTask = (req, res) => {
  const { text } = req.body;

  // Validation: Check if text is present and is a non-empty string
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'Task text is required' });
  }

  // Create new task object
  const newTask = {
    id: currentId++,
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
};

/**
 * PUT /api/tasks/:id
 * Updates an existing task.
 */
export const updateTask = (req, res) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID format. Must be a number.' });
  }

  const taskIndex = findTaskIndex(id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { text, completed } = req.body;

  // Input Validation: If text is provided, it must be a non-empty string
  if (text !== undefined && (typeof text !== 'string' || text.trim() === '')) {
    return res.status(400).json({ error: 'Task text cannot be empty' });
  }

  // Input Validation: If completed is provided, it must be a boolean
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed status must be a boolean' });
  }

  // Update task fields dynamically
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    text: text !== undefined ? text.trim() : tasks[taskIndex].text,
    completed: completed !== undefined ? completed : tasks[taskIndex].completed
  };

  res.status(200).json(tasks[taskIndex]);
};

/**
 * DELETE /api/tasks/:id
 * Deletes a task by ID.
 */
export const deleteTask = (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID format. Must be a number.' });
  }

  const initialLength = tasks.length;
  tasks = tasks.filter(task => task.id !== id);

  // If the array length didn't change, the task was not found
  if (tasks.length === initialLength) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // 204 No Content signifies successful deletion with no body response
  res.status(204).end();
};
