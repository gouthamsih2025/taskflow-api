import assert from 'assert';

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('--- Starting Automated API Verification ---');
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

  // Wait a moment for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 1: Root route
  await test('GET / (Welcome Endpoint)', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.name, 'TaskFlow API');
  });

  // Test 2: GET /api/tasks (Initial, should be empty)
  await test('GET /api/tasks (Initially Empty)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.strictEqual(data.length, 0);
  });

  // Test 3: POST /api/tasks (Valid task creation)
  let createdTask;
  await test('POST /api/tasks (Create Valid Task)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Verify Node Express setup' })
    });
    assert.strictEqual(res.status, 201);
    createdTask = await res.json();
    assert.strictEqual(createdTask.id, 1);
    assert.strictEqual(createdTask.text, 'Verify Node Express setup');
    assert.strictEqual(createdTask.completed, false);
    assert.ok(createdTask.createdAt);
  });

  // Test 4: POST /api/tasks (Invalid task - empty text)
  await test('POST /api/tasks (Create Invalid Task - Empty Text)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' })
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'Task text is required');
  });

  // Test 5: GET /api/tasks (After task creation)
  await test('GET /api/tasks (Verify Task Exists)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.length, 1);
    assert.strictEqual(data[0].id, 1);
  });

  // Test 6: GET /api/tasks/:id (Get single task by ID)
  await test('GET /api/tasks/1 (Retrieve Single Task)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/1`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.id, 1);
    assert.strictEqual(data.text, 'Verify Node Express setup');
  });

  // Test 7: GET /api/tasks/:id (Non-existent task)
  await test('GET /api/tasks/999 (Task Not Found)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/999`);
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.error, 'Task not found');
  });

  // Test 8: PUT /api/tasks/:id (Update task text and completed status)
  await test('PUT /api/tasks/1 (Update Task)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Verify Node Express setup - Updated', completed: true })
    });
    assert.strictEqual(res.status, 200);
    const updated = await res.json();
    assert.strictEqual(updated.id, 1);
    assert.strictEqual(updated.text, 'Verify Node Express setup - Updated');
    assert.strictEqual(updated.completed, true);
  });

  // Test 9: DELETE /api/tasks/:id (Delete task)
  await test('DELETE /api/tasks/1 (Delete Task)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/1`, { method: 'DELETE' });
    assert.strictEqual(res.status, 204);
  });

  // Test 10: GET /api/tasks/:id (Verify deleted task is 404)
  await test('GET /api/tasks/1 (Verify Deleted Task is 404)', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks/1`);
    assert.strictEqual(res.status, 404);
  });

  // Test 11: GET undefined route (Verify 404 fallback)
  await test('GET /api/invalid-route (404 Fallback)', async () => {
    const res = await fetch(`${BASE_URL}/api/invalid-route`);
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.error, 'Endpoint not found');
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
