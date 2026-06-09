# Backend Patterns — Node.js & Express

## Scalability Red Flags

### N+1 Query Problem
❌ Loop with DB call inside (10 users = 11 queries):
```js
const users = await db.user.find({ role: 'admin' });

for (const user of users) {
  const posts = await db.post.find({ userId: user.id });
  user.posts = posts;
}
```

✅ Fetch related data in one query:
```js
// ORM eager load
const users = await db.user.find({ role: 'admin' }, { include: { posts: true } });

// Or SQL JOIN
const users = await db.query(`
  SELECT u.*, json_agg(p.*) as posts
  FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
  WHERE u.role = 'admin'
  GROUP BY u.id
`);
```

### Missing Pagination
❌ Fetching all 1M records:
```js
app.get('/users', async (req, res) => {
  const users = await db.user.find({}); // All records!
  res.json(users);
});
```

✅ Paginate with cursor or offset/limit:
```js
app.get('/users', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = parseInt(req.query.offset) || 0;

  const users = await db.user.find({})
    .skip(offset)
    .limit(limit);

  res.json({ data: users, offset, limit });
});

// Or cursor-based (better for large datasets):
app.get('/users', async (req, res) => {
  const cursor = req.query.cursor ? parseInt(req.query.cursor) : null;
  const limit = 20;

  let query = db.user.find({}).limit(limit + 1);
  if (cursor) query = query.where('id').gt(cursor);

  const users = await query;
  const hasMore = users.length > limit;
  const data = hasMore ? users.slice(0, -1) : users;

  res.json({
    data,
    cursor: hasMore ? data[data.length - 1].id : null,
  });
});
```

### Blocking I/O
❌ Synchronous file operations or loops block event loop:
```js
app.get('/data', (req, res) => {
  const file = fs.readFileSync('./large-file.json'); // Blocks all requests!
  res.json(JSON.parse(file));
});
```

✅ Use async/await:
```js
app.get('/data', async (req, res) => {
  const file = await fs.promises.readFile('./large-file.json');
  res.json(JSON.parse(file));
});
```

### Missing Database Indexes
❌ Filter on unindexed column (full table scan at scale):
```js
app.get('/posts/:userId', async (req, res) => {
  const posts = await db.query(
    'SELECT * FROM posts WHERE user_id = ?',
    [req.params.userId]
  );
  res.json(posts);
});
```

✅ Create index:
```sql
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

### Missing Error Handling
❌ Unhandled promise rejection crashes server:
```js
app.get('/data', async (req, res) => {
  const result = await db.query('SELECT * FROM users');
  res.json(result);
  // If query fails, server crashes!
});
```

✅ Wrap in try/catch:
```js
app.get('/data', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM users');
    res.json(result);
  } catch (err) {
    next(err);
  }
});
```

### Missing Retry Logic
❌ External call fails once → entire request fails:
```js
const response = await fetch('https://payment-api.com/charge', {
  method: 'POST',
  body: JSON.stringify({ amount: 100 }),
});
```

✅ Retry with exponential backoff:
```js
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      const delay = Math.pow(2, i) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

### No Connection Pooling
❌ Create new DB connection per request:
```js
app.get('/users', async (req, res) => {
  const connection = await db.createConnection(); // New connection!
  const users = await connection.query('SELECT * FROM users');
  await connection.close();
  res.json(users);
});
```

✅ Use connection pool:
```js
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Max connections in pool
  idleTimeoutMillis: 30000,
});

app.get('/users', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users');
    res.json(result.rows);
  } finally {
    client.release();
  }
});
```

### Missing Rate Limiting
❌ No protection against abuse:
```js
app.post('/login', async (req, res) => {
  const user = await db.user.findOne({ email: req.body.email });
  // Brute force attack!
});
```

✅ Add rate limiting:
```js
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts',
});

app.post('/login', loginLimiter, async (req, res) => {
  const user = await db.user.findOne({ email: req.body.email });
  res.json(user);
});
```

### Missing Timeouts
❌ Hanging requests consume resources forever:
```js
const response = await fetch('https://slow-api.com/data', {
  // No timeout!
});
```

✅ Set timeout:
```js
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch('https://slow-api.com/data', {
    signal: controller.signal,
  });
  clearTimeout(timeout);
} catch (err) {
  if (err.name === 'AbortError') {
    res.status(504).json({ error: 'Request timeout' });
  }
}
```

## Async Patterns

### Async/Await with Proper Error Handling
```js
app.post('/users', async (req, res, next) => {
  try {
    const user = await db.user.create(req.body);
    await sendWelcomeEmail(user.email);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});
```

### Promise.all for Parallel Operations
```js
app.get('/user/:id', async (req, res, next) => {
  try {
    const [user, posts, comments] = await Promise.all([
      db.user.findById(req.params.id),
      db.post.find({ userId: req.params.id }),
      db.comment.find({ userId: req.params.id }),
    ]);
    res.json({ user, posts, comments });
  } catch (err) {
    next(err);
  }
});
```

### Circuit Breaker for Downstream Services
```js
import CircuitBreaker from 'opossum';

const breaker = new CircuitBreaker(
  async () => fetch('https://payment-api.com').then(r => r.json()),
  { timeout: 3000, errorThresholdPercentage: 50 }
);

app.post('/charge', async (req, res, next) => {
  try {
    const result = await breaker.fire();
    res.json(result);
  } catch (err) {
    res.status(503).json({ error: 'Payment service unavailable' });
  }
});
```

## Structured Logging & Observability

❌ Unstructured logs (hard to parse, query, alert on):
```js
console.log('User created: ' + userId);
console.error('DB error: ' + err.message);
```

✅ Structured JSON logging:
```js
const logger = require('pino')();

app.post('/users', async (req, res) => {
  logger.info({ event: 'user_create_start', user_id: req.body.email });
  
  try {
    const user = await db.user.create(req.body);
    logger.info({ event: 'user_created', user_id: user.id, duration_ms: Date.now() - startTime });
    res.json(user);
  } catch (err) {
    logger.error({ event: 'user_create_failed', error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Failed to create user' });
  }
});
```

## NestJS Specifics

Use TypeScript decorators for consistent patterns:
```ts
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```
