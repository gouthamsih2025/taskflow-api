import assert from 'assert';
import mongoose from 'mongoose';

// ==========================================
// Mongoose and Database Mock Layer
// ==========================================

let mockTasks = [];
let mockIdCounter = 1001; // Mock MongoDB ObjectIds

// Mock Database Connection
mongoose.connect = async () => {
  console.log('MongoDB Connected: cluster0-mock.mongodb.net (Mocked)');
  return {
    connection: { host: 'cluster0-mock.mongodb.net' }
  };
};

// Mock Mongoose Query Chain Builder
class MockQuery {
  constructor(data) {
    this.data = data;
  }
  sort(options) {
    // Sort logic: newest first by default
    this.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return this;
  }
  skip(n) {
    this.data = this.data.slice(n);
    return this;
  }
  limit(l) {
    this.data = this.data.slice(0, l);
    return this;
  }
  lean() {
    return this;
  }
  then(resolve) {
    resolve(this.data);
  }
}

// Mock Task Model class representing MongoDB Collection
class MockTask {
  constructor(data) {
    this.text = data.text;
    this.completed = data.completed !== undefined ? data.completed : false;
    this.createdAt = new Date();
    this.lastModified = new Date();
  }

  async save() {
    // Simulate Mongoose Schema validations
    if (this.text === undefined || this.text === null || this.text === '') {
      const err = new Error('Task validation failed: text: Task text is required');
      err.name = 'ValidationError';
      throw err;
    }
    if (typeof this.text !== 'string' || this.text.trim().length < 3) {
      const err = new Error('Task validation failed: text: Task text must be at least 3 characters');
      err.name = 'ValidationError';
      throw err;
    }
    if (this.text.length > 255) {
      const err = new Error('Task validation failed: text: Task text cannot exceed 255 characters');
      err.name = 'ValidationError';
      throw err;
    }

    this._id = (mockIdCounter++).toString();
    this.text = this.text.trim();
    mockTasks.push(this);
    return this;
  }
}

// Attach mock static methods to simulate Mongoose operations
MockTask.find = function(query) {
  let filtered = [...mockTasks];
  if (query && query.$text) {
    const searchWord = query.$text.$search.toLowerCase();
    filtered = filtered.filter(t => t.text.toLowerCase().includes(searchWord));
  }
  return new MockQuery(filtered);
};

MockTask.findById = function(id) {
  // Validate ID format (simulating CastError for non-standard IDs)
  if (id === 'invalid-id-format') {
    const err = new Error('Cast to ObjectId failed for value "invalid-id-format" at path "_id"');
    err.name = 'CastError';
    err.value = id;
    throw err;
  }
  const task = mockTasks.find(t => t._id === id);
  
  const queryChain = {
    lean: () => queryChain,
    then: (resolve) => resolve(task)
  };
  return queryChain;
};

MockTask.findByIdAndUpdate = async function(id, updateData, options) {
  if (id === 'invalid-id-format') {
    const err = new Error('Cast to ObjectId failed for value "invalid-id-format" at path "_id"');
    err.name = 'CastError';
    err.value = id;
    throw err;
  }
  
  const task = mockTasks.find(t => t._id === id);
  if (!task) return null;

  if (updateData.text !== undefined) {
    if (typeof updateData.text !== 'string' || updateData.text.trim().length < 3) {
      const err = new Error('Task validation failed: text: Task text must be at least 3 characters');
      err.name = 'ValidationError';
      throw err;
    }
    task.text = updateData.text.trim();
  }

  if (updateData.completed !== undefined) {
    task.completed = !!updateData.completed;
  }

  task.lastModified = new Date();
  return task;
};

MockTask.findByIdAndDelete = async function(id) {
  if (id === 'invalid-id-format') {
    const err = new Error('Cast to ObjectId failed for value "invalid-id-format" at path "_id"');
    err.name = 'CastError';
    err.value = id;
    throw err;
  }
  
  const index = mockTasks.findIndex(t => t._id === id);
  if (index === -1) return null;
  const deleted = mockTasks.splice(index, 1)[0];
  return deleted;
};

MockTask.countDocuments = async function() {
  return mockTasks.length;
};

// Intercept model compilation
mongoose.model = (name) => {
  return MockTask;
};

// ==========================================
// Start Express App Server In-Process
// ==========================================
console.log('Spawning mocked server for verification...');
await import('../server.js');

// ==========================================
// Test Cases Execution Suite
// ==========================================
const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('\n--- Starting Automated Task 4 API Verification ---');
  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}: ${err.message}`);
      failed++;
    }
  };

  // Wait for server connection to print logs
  await new Promise(resolve => setTimeout(resolve, 500));

  // Test 1: Root route
  await test('GET / (Welcome Endpoint)', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.name, 'TaskFlow DB API');
  });

  // Test 2: GET /api/tasks (Initial state)
  await test('GET /api/tasks (Initially Empty)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.strictEqual(data.length, 0);
  });

  // Test 3: POST /api/tasks (Valid task 1 creation)
  let task1Id;
  await test('POST /api/tasks (Create Task 1: Learn Express)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Learn Express and Mongoose' })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data._id);
    task1Id = data._id;
    assert.strictEqual(data.text, 'Learn Express and Mongoose');
    assert.strictEqual(data.completed, false);
  });

  // Test 4: POST /api/tasks (Valid task 2 creation)
  await test('POST /api/tasks (Create Task 2: Build React)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Build React Frontend Client' })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.text, 'Build React Frontend Client');
  });

  // Test 5: POST /api/tasks (Valid task 3 creation)
  await test('POST /api/tasks (Create Task 3: Configure Atlas)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Configure MongoDB Atlas Database' })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.text, 'Configure MongoDB Atlas Database');
  });

  // Test 6: POST /api/tasks (Validation Check: Text length < 3)
  await test('POST /api/tasks (Validation: Text length too short)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'No' })
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('must be at least 3 characters'));
  });

  // Test 7: GET /api/tasks (Without Pagination)
  await test('GET /api/tasks (Retrieve All Tasks)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.length, 3);
  });

  // Test 8: GET /api/tasks (With Pagination)
  await test('GET /api/tasks (Retrieve Paginated Tasks)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks?page=1&limit=2`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.tasks);
    assert.strictEqual(data.tasks.length, 2);
    assert.strictEqual(data.totalPages, 2);
    assert.strictEqual(data.currentPage, 1);
  });

  // Test 9: GET /api/tasks/search?q=MongoDB (Text Search)
  await test('GET /api/tasks/search (Text Search Matching Term)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/search?q=MongoDB`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.length, 1);
    assert.strictEqual(data[0].text, 'Configure MongoDB Atlas Database');
  });

  // Test 10: GET /api/tasks/:id (Single task query)
  await test('GET /api/tasks/:id (Retrieve Single Task)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/${task1Id}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data._id, task1Id);
  });

  // Test 11: GET /api/tasks/invalid-id-format (CastError validation)
  await test('GET /api/tasks/:id (Invalid ID CastError Check)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/invalid-id-format`);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes('Invalid ID format'));
  });

  // Test 12: PUT /api/tasks/:id (Valid update)
  await test('PUT /api/tasks/:id (Update task completed status)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/${task1Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Learn Express, Mongoose & MongoDB Atlas', completed: true })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.text, 'Learn Express, Mongoose & MongoDB Atlas');
    assert.strictEqual(data.completed, true);
  });

  // Test 13: DELETE /api/tasks/:id (Delete task)
  await test('DELETE /api/tasks/:id (Delete Task)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/${task1Id}`, { method: 'DELETE' });
    assert.strictEqual(res.status, 204);
  });

  // Test 14: GET /api/tasks/:id (Verify deleted task returns 404)
  await test('GET /api/tasks/:id (Verify Deleted Task is 404)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/${task1Id}`);
    assert.strictEqual(res.status, 404);
  });

  console.log('\n--- Verification Summary ---');
  console.log(`Passed: ${passed}/${passed + failed}`);
  if (failed > 0) {
    console.log(`Failed: ${failed}`);
    process.exit(1);
  } else {
    console.log('All tests passed successfully!');
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal testing error:', err);
  process.exit(1);
});
