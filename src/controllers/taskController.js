import Task from '../models/Task.js';

/**
 * Helper: Processes database exceptions and sends corresponding responses.
 * Detects Mongoose ValidationError or CastError to return 400 Bad Request,
 * falling back to a 500 Internal Server Error for unhandled exceptions.
 * 
 * @param {object} res - Express response object.
 * @param {Error} error - The caught database error.
 */
const handleDBError = (res, error) => {
  console.error('Database Operation Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ID format: ${error.value}` });
  }

  res.status(500).json({ error: 'Database operation failed' });
};

/**
 * GET /api/tasks
 * Retrieves tasks sorted by newest first.
 * Supports pagination if 'page' and 'limit' query parameters are provided.
 */
export const getTasks = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // If pagination parameters are present, return paginated output structure
    if (page || limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const skip = (pageNum - 1) * limitNum;

      const [tasks, count] = await Promise.all([
        Task.find().sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
        Task.countDocuments()
      ]);

      return res.status(200).json({
        tasks,
        totalPages: Math.ceil(count / limitNum),
        currentPage: pageNum,
        totalTasks: count
      });
    }

    // Default: Retrieve all tasks sorted by newest first
    const tasks = await Task.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(tasks);
  } catch (error) {
    handleDBError(res, error);
  }
};

/**
 * GET /api/tasks/search?q=keyword
 * Searches tasks by text content using MongoDB full-text indexes.
 */
export const searchTasks = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Search query parameter "q" is required' });
    }

    // Query tasks matching the text criteria, sorting by relevance score
    const results = await Task.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).lean();

    res.status(200).json(results);
  } catch (error) {
    handleDBError(res, error);
  }
};

/**
 * GET /api/tasks/:id
 * Retrieves a single task from the database by its ID.
 */
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).lean();
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    handleDBError(res, error);
  }
};

/**
 * POST /api/tasks
 * Creates a new task record in the database.
 */
export const createTask = async (req, res) => {
  try {
    // Model schema validators will check text constraint requirements automatically
    const task = new Task({ text: req.body.text });
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    handleDBError(res, error);
  }
};

/**
 * PUT /api/tasks/:id
 * Updates an existing task record.
 */
export const updateTask = async (req, res) => {
  try {
    const updateData = {};
    
    // Construct update payload dynamically to support partial updates
    if (req.body.text !== undefined) updateData.text = req.body.text;
    if (req.body.completed !== undefined) updateData.completed = req.body.completed;
    
    // Explicitly update lastModified
    updateData.lastModified = Date.now();

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    handleDBError(res, error);
  }
};

/**
 * DELETE /api/tasks/:id
 * Deletes a task record from the database by ID.
 */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).end();
  } catch (error) {
    handleDBError(res, error);
  }
};

// Explicitly export pagination controller logic in case it is requested separately
export const getPaginatedTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [tasks, count] = await Promise.all([
      Task.find().skip(skip).limit(limit),
      Task.countDocuments()
    ]);

    res.status(200).json({
      tasks,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    handleDBError(res, error);
  }
};
