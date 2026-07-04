import mongoose from 'mongoose';

/**
 * Task Mongoose Schema definition.
 * Specifies fields, validations, and options for the Tasks collection.
 */
const taskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Task text is required'],
    trim: true,
    minlength: [3, 'Task text must be at least 3 characters'],
    maxlength: [255, 'Task text cannot exceed 255 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  // Use Mongoose timestamps feature to manage lastModified (updatedAt) automatically,
  // while keeping our custom manual createdAt field.
  timestamps: { createdAt: false, updatedAt: 'lastModified' }
});

// Configure Performance and Feature Indexes
// 1. Text index on the 'text' field to enable keyword search queries ($text operator)
taskSchema.index({ text: 'text' });

// 2. Single-field index on the 'completed' field for optimized filtering (All vs Active vs Completed)
taskSchema.index({ completed: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
