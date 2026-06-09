# Frontend Patterns — React & Next.js

## Scalability Red Flags

### Waterfall Fetches
❌ Sequential data loading (component waits for first fetch before starting second):
```tsx
const MyPage = async () => {
  const user = await fetchUser();
  const posts = await fetchPosts(user.id); // Waits for user first!
  return <div>{posts}</div>;
};
```

✅ Parallel fetches (all start simultaneously):
```tsx
const [user, posts] = await Promise.all([
  fetchUser(),
  fetchPosts(userId),
]);
```

### Missing React.memo / useMemo
❌ Parent re-render causes expensive child re-renders:
```tsx
export const CommentList = ({ comments }) => (
  <div>
    {comments.map(c => <ExpensiveComment comment={c} />)}
  </div>
);
```

✅ Memoize expensive children:
```tsx
const ExpensiveComment = React.memo(({ comment }) => {
  // Heavy computation or rendering
  return <div>{comment.text}</div>;
});

export const CommentList = ({ comments }) => (
  <div>
    {comments.map(c => <ExpensiveComment comment={c} key={c.id} />)}
  </div>
);
```

### Inline Objects as Props
❌ Creates new object on every render → child re-renders:
```tsx
<Card style={{ padding: 16, color: 'blue' }} />
<Chart options={{ responsive: true }} />
```

✅ Extract to constant or useMemo:
```tsx
const cardStyle = { padding: 16, color: 'blue' };
const chartOptions = useMemo(() => ({ responsive: true }), []);
<Card style={cardStyle} />
<Chart options={chartOptions} />
```

### Missing Virtual Lists
❌ Rendering 1000 items → 1000 DOM nodes (crashes):
```tsx
{items.map(item => <Item key={item.id} item={item} />)}
```

✅ Use tanstack-virtual (renders only visible items):
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export const VirtualList = ({ items }) => {
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef}>
      {virtualizer.getVirtualItems().map(item => (
        <div key={item.key} style={{ transform: `translateY(${item.start}px)` }}>
          {items[item.index].name}
        </div>
      ))}
    </div>
  );
};
```

### Bundle Bloat
❌ Importing entire library for one function:
```tsx
import _ from 'lodash';
const doubled = _.map(items, x => x * 2);
```

✅ Import specific function or use native:
```tsx
import map from 'lodash/map';
const doubled = items.map(x => x * 2);
```

### Missing Lazy Loading
❌ All routes loaded upfront:
```tsx
import AdminPanel from './AdminPanel';
import Dashboard from './Dashboard';

export const App = () => (
  <Routes>
    <Route path="/admin" element={<AdminPanel />} />
    <Route path="/" element={<Dashboard />} />
  </Routes>
);
```

✅ Code-split heavy routes:
```tsx
const AdminPanel = lazy(() => import('./AdminPanel'));
const Dashboard = lazy(() => import('./Dashboard'));

export const App = () => (
  <Suspense fallback={<Spinner />}>
    <Routes>
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/" element={<Dashboard />} />
    </Routes>
  </Suspense>
);
```

## Core Web Vitals

| Metric | Target | Problem |
|--------|--------|---------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Missing image optimization, blocking CSS/JS |
| **FID** (First Input Delay) | < 100ms | JS blocking main thread, large event handlers |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Unspecified image dimensions, late-loaded fonts |

## State Management at Scale

❌ Prop drilling (passing state through 5+ levels):
```tsx
<Page user={user}>
  <Section user={user}>
    <Card user={user}>
      <Header user={user} />
    </Card>
  </Section>
</Page>
```

✅ Use Context (< 3 levels) or state manager (TanStack Query, Zustand, Redux):
```tsx
const UserContext = createContext();

export const Page = () => (
  <UserContext.Provider value={user}>
    <Section />
  </UserContext.Provider>
);

const Header = () => {
  const user = useContext(UserContext);
  return <div>{user.name}</div>;
};
```

## Rendering Strategy

| Strategy | When | Pros | Cons |
|----------|------|------|------|
| **SSR** | Public pages, SEO critical | Fast FCP, SEO friendly | Slower TTFB, server load |
| **SSG** | Static content, blogs | Fastest, cacheable | Build time, stale content |
| **ISR** (Incremental Static Revalidation) | Hybrid (static + dynamic) | Cache + freshness | Complex, revalidation delay |
| **CSR** (Client-Side Render) | Dashboards, interactive UIs | Simple, no server | Slower FCP, JS overhead |

## Next.js Specifics

### Use Server Components (React 19+)
```tsx
// app/posts/page.tsx (Server Component by default)
export default async function PostsPage() {
  const posts = await db.post.findMany();
  return <PostList posts={posts} />;
}
```

### Client Components for Interactivity
```tsx
'use client';
export const SearchBox = () => {
  const [query, setQuery] = useState('');
  return <input onChange={e => setQuery(e.target.value)} />;
};
```

### Image Optimization
```tsx
import Image from 'next/image';

<Image
  src="/photo.jpg"
  alt="Photo"
  width={640}
  height={480}
  priority // Preload above-the-fold images
/>
```

### Dynamic Imports
```tsx
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
});
```
