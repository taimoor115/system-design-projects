# Database Patterns — SQL, Schema & Queries

## Schema Design Red Flags

### Missing Relationships & Constraints
❌ No foreign keys, allowing orphaned data:
```sql
CREATE TABLE posts (
  id INT PRIMARY KEY,
  title VARCHAR(255),
  user_id INT -- No FK constraint
);
```

✅ Add foreign key to enforce referential integrity:
```sql
CREATE TABLE posts (
  id INT PRIMARY KEY,
  title VARCHAR(255),
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Wrong Data Types
❌ Storing numbers as strings, dates as VARCHAR:
```sql
CREATE TABLE products (
  id INT PRIMARY KEY,
  price VARCHAR(50), -- Should be DECIMAL!
  created_at VARCHAR(19), -- Should be TIMESTAMP!
  is_active VARCHAR(5) -- Should be BOOLEAN!
);
```

✅ Use appropriate types:
```sql
CREATE TABLE products (
  id INT PRIMARY KEY,
  price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

### Unbounded Arrays (MongoDB)
❌ Storing unlimited items in single document:
```json
{
  "_id": 1,
  "title": "Popular Post",
  "comments": [ /* 10M comments in array */ ]
}
```

Result: 16MB document limit hit, query slowdown, memory issues.

✅ Move to separate collection with reference:
```json
// posts
{ "_id": 1, "title": "Popular Post", "comment_count": 10000000 }

// comments (separate collection)
{ "_id": 1, "post_id": 1, "text": "..." }
```

Then query with JOIN/aggregation:
```js
db.posts.aggregate([
  { $match: { _id: 1 } },
  { $lookup: { from: 'comments', localField: '_id', foreignField: 'post_id', as: 'comments' } }
]);
```

### Missing Indexes
❌ Filtering/sorting on unindexed columns (full table scan):
```sql
SELECT * FROM orders WHERE customer_id = 123 AND status = 'pending';
-- No index on (customer_id, status) → scans entire table
```

✅ Create composite index:
```sql
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
```

Then the query uses index (fast):
```sql
EXPLAIN SELECT * FROM orders WHERE customer_id = 123 AND status = 'pending';
-- Index Scan: fast
```

### Missing Soft Deletes
❌ Hard delete → data loss, can't restore:
```sql
DELETE FROM users WHERE id = 123;
-- User is gone forever. What if they need recovery?
```

✅ Use soft delete column:
```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;

UPDATE users SET deleted_at = NOW() WHERE id = 123;

SELECT * FROM users WHERE deleted_at IS NULL; -- Active users only
```

## Query Performance

### Over-Fetching
❌ Fetching unused columns (wasted bandwidth):
```sql
SELECT * FROM users; -- Fetches 100+ columns, need only 3
```

✅ Select only needed fields:
```sql
SELECT id, email, created_at FROM users;
```

### Race Conditions
❌ Non-atomic read-modify-write:
```js
const user = await db.user.findById(id); // Read
user.balance -= 50;
await db.user.update(id, user); // Write
// Between read & write, another process could modify balance!
```

✅ Use atomic updates:
```sql
UPDATE users SET balance = balance - 50 WHERE id = ? AND balance >= 50;
-- All in one operation. No race condition.
```

Or use transactions:
```js
await db.transaction(async (trx) => {
  const user = await trx('users').where('id', id).forUpdate(); // Lock row
  if (user.balance < 50) throw new Error('Insufficient balance');
  await trx('users').update({ balance: user.balance - 50 }).where('id', id);
});
```

### Missing Transaction Boundaries
❌ Multi-step writes without atomicity:
```js
await db.user.create(userData);
await db.email.create(emailData);
// If second fails, user exists but email wasn't sent
```

✅ Wrap in transaction:
```js
await db.transaction(async (trx) => {
  const user = await trx('users').insert(userData);
  await trx('emails').insert({ userId: user.id, ...emailData });
  // Either both succeed or both rollback
});
```

### Unbounded Query Results
❌ Fetching all matching rows (OOM if 1M matches):
```sql
SELECT * FROM logs WHERE severity = 'ERROR'; -- Could be millions!
```

✅ Use LIMIT and pagination:
```sql
SELECT * FROM logs WHERE severity = 'ERROR' LIMIT 1000 OFFSET 0;
```

Or cursor-based:
```sql
SELECT * FROM logs WHERE severity = 'ERROR' AND id > ? ORDER BY id LIMIT 1000;
```

### Missing Query Timeout
❌ Long-running query locks resources forever:
```sql
SELECT COUNT(*) FROM huge_table WHERE expensive_calculation(...);
-- Runs for 30 minutes, blocks other queries
```

✅ Add timeout:
```sql
SET LOCAL statement_timeout TO '5s';
SELECT COUNT(*) FROM huge_table WHERE expensive_calculation(...);
```

## Caching Patterns

### Cache-Aside (Lazy Loading)
```js
async function getUserWithCache(id) {
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);

  const user = await db.user.findById(id);
  await redis.setex(`user:${id}`, 3600, JSON.stringify(user));
  return user;
}
```

### Write-Through
```js
async function updateUser(id, data) {
  const user = await db.user.update(id, data);
  await redis.setex(`user:${id}`, 3600, JSON.stringify(user));
  return user;
}
```

### Cache Invalidation
```js
async function deleteUser(id) {
  await db.user.delete(id);
  await redis.del(`user:${id}`);
  // Invalidate related caches
  await redis.del(`users:list`);
}
```

## MongoDB-Specific Patterns

### Embedding vs. Referencing
Embed when:
- Related data always fetched together
- Limited array size (< 1000 items)
- Infrequent updates

Reference when:
- Related data accessed independently
- Unbounded array size
- Frequent updates

❌ Embed reviews in product (array can grow unbounded):
```json
{
  "_id": 1,
  "title": "Popular Product",
  "reviews": [ /* 100K+ reviews */ ]
}
```

✅ Separate collection with reference:
```json
// products
{ "_id": 1, "title": "Popular Product" }

// reviews
{ "_id": 1, "product_id": 1, "rating": 5, "text": "..." }
```

### TTL Indexes (Auto-Delete Old Data)
```js
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });
// Automatically delete sessions older than 1 hour
```

## Drizzle ORM (Your Project)

### Use Relations to Avoid N+1
❌ Loop causes N+1:
```ts
const authors = await db.select().from(authors);
for (const author of authors) {
  const books = await db.select().from(books).where(eq(books.authorId, author.id));
  author.books = books;
}
```

✅ Use relations (eager load):
```ts
const authorsWithBooks = await db.query.authors.findMany({
  with: { books: true },
});
```

### Use Indexes in Migrations
```sql
CREATE TABLE posts (
  id INT PRIMARY KEY,
  user_id INT NOT NULL,
  status VARCHAR(20),
  created_at TIMESTAMP
);

CREATE INDEX idx_posts_user_status ON posts(user_id, status);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
```

### Use Transactions
```ts
await db.transaction(async (trx) => {
  const user = await trx.insert(users).values(userData).returning();
  await trx.insert(emails).values({ userId: user.id, ...emailData });
});
```
