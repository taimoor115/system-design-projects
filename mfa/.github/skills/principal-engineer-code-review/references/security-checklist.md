# Security Checklist — OWASP Top 10

## 1. SQL Injection

❌ Never raw interpolate user input into SQL:
```js
const query = `SELECT * FROM users WHERE email = '${req.body.email}'`;
const users = await db.query(query);
// Attacker sends: ' OR '1'='1
// Query becomes: SELECT * FROM users WHERE email = '' OR '1'='1'
```

✅ Use parameterized queries:
```js
const users = await db.query(
  'SELECT * FROM users WHERE email = ?',
  [req.body.email]
);
```

Or ORM (Drizzle):
```ts
const user = await db.query.users.findFirst({
  where: eq(users.email, req.body.email),
});
```

## 2. Broken Authentication

### Missing JWT Expiry
❌ Token never expires:
```js
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
// Token is valid forever — huge security risk
```

✅ Set expiry:
```js
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
```

### Missing Token Refresh
When access token expires, force re-login instead of issuing infinite tokens.

```js
// On login
const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });

res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
});

res.json({ accessToken });

// On /refresh endpoint
const refreshToken = req.cookies.refreshToken;
const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
res.json({ accessToken: newAccessToken });
```

### Weak Password Requirements
```js
const isStrongPassword = (pwd) => {
  return pwd.length >= 12 &&
    /[A-Z]/.test(pwd) &&
    /[a-z]/.test(pwd) &&
    /[0-9]/.test(pwd) &&
    /[!@#$%^&*]/.test(pwd);
};
```

## 3. Insecure Direct Object References (IDOR)

❌ Exposing user ID without ownership check:
```js
app.get('/posts/:id', async (req, res) => {
  const post = await db.post.findById(req.params.id);
  res.json(post); // Any user can read ANY post!
});
```

✅ Verify ownership:
```js
app.get('/posts/:id', async (req, res) => {
  const post = await db.post.findOne({
    id: req.params.id,
    userId: req.user.id, // Only own posts
  });

  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json(post);
});
```

## 4. Missing Input Validation

❌ No validation:
```js
app.post('/users', async (req, res) => {
  const user = await db.user.create(req.body);
  res.json(user);
  // Attacker sends malicious data
});
```

✅ Validate with Zod (or Joi, Yup):
```ts
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  age: z.number().int().min(18).max(120),
});

app.post('/users', async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const user = await db.user.create(parsed.data);
  res.json(user);
});
```

## 5. Broken Access Control

### Missing Role Checks
❌ No authorization on admin routes:
```js
app.post('/admin/users', async (req, res) => {
  const user = await db.user.create(req.body);
  res.json(user);
  // Any logged-in user can create admin users!
});
```

✅ Guard with role-based middleware:
```js
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

app.post('/admin/users', requireAdmin, async (req, res) => {
  const user = await db.user.create(req.body);
  res.json(user);
});
```

## 6. Missing Security Headers

❌ No headers set:
```js
app.get('/', (req, res) => {
  res.send('<html>Home</html>');
  // Missing security headers
});
```

✅ Use helmet middleware:
```js
import helmet from 'helmet';
app.use(helmet());

// Or manually set:
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

## 7. Missing CORS Restrictions

❌ Open CORS (any origin can request):
```js
app.use(cors());
```

✅ Restrict to specific origins:
```js
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com'],
  credentials: true,
}));
```

## 8. Hardcoded Secrets

❌ Secrets in code:
```js
const password = 'super-secret-db-password';
const apiKey = 'sk_live_abc123...';
```

✅ Load from environment variables:
```js
const password = process.env.DB_PASSWORD;
const apiKey = process.env.EXTERNAL_API_KEY;

if (!password || !apiKey) {
  throw new Error('Missing required environment variables');
}
```

## 9. Missing CSRF Protection

❌ No CSRF token validation:
```js
app.post('/transfer', async (req, res) => {
  await db.transaction.create(req.body);
  res.json({ success: true });
  // Attacker's site can POST to this endpoint
});
```

✅ Use CSRF token middleware:
```js
import csrf from 'csurf';

app.use(csrf({ cookie: true }));

app.post('/transfer', async (req, res) => {
  // req.csrfToken() validated automatically
  await db.transaction.create(req.body);
  res.json({ success: true });
});

// Return token in forms:
app.get('/form', (req, res) => {
  res.send(`
    <form method="post" action="/transfer">
      <input type="hidden" name="_csrf" value="${req.csrfToken()}">
      <button>Transfer</button>
    </form>
  `);
});
```

## 10. Sensitive Data Exposure

### Logging Secrets
❌ Logging password or token:
```js
console.log('User login:', req.body);
// Logs: { email: 'user@example.com', password: 'secret123' }
```

✅ Sanitize before logging:
```js
const sanitized = { ...req.body, password: '***' };
console.log('User login:', sanitized);
```

### Exposing Stack Traces
❌ Returning error stack to client:
```js
app.get('/data', async (req, res) => {
  try {
    const data = await db.query(...);
  } catch (err) {
    res.status(500).json({ error: err.stack });
    // Attacker learns database structure
  }
});
```

✅ Generic error message, log details server-side:
```js
app.get('/data', async (req, res) => {
  try {
    const data = await db.query(...);
  } catch (err) {
    logger.error({ error: err.stack, userId: req.user.id });
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Implementation Checklist

- [ ] All user inputs validated (email, length, type)
- [ ] All database queries parameterized (no string interpolation)
- [ ] JWT tokens have expiry & refresh mechanism
- [ ] All admin endpoints require role check
- [ ] IDOR check on all `/resource/:id` endpoints
- [ ] helmet.js or manual security headers set
- [ ] CORS restricted to known domains
- [ ] CSRF tokens on all POST/PUT/DELETE
- [ ] No secrets in code (env vars only)
- [ ] Error pages don't expose stack traces
- [ ] Sensitive fields sanitized before logging
- [ ] HTTPS enforced in production
- [ ] Rate limiting on auth endpoints
