# Scaling a Rails Application

When traffic grows, Rails applications must scale.

------------------------------------------------------------------------

## 1. Web Server Scaling

Rails often runs with **Puma**.

Puma uses:

-   workers (processes)
-   threads

Example config:

    workers 4
    threads 5,5

Total concurrency:

    4 * 5 = 20 requests

------------------------------------------------------------------------

## 2. Database Connection Pool

Rails must manage DB connections carefully.

Example:

``` ruby
pool: 5
```

If threads exceed pool size, requests wait for connections.

------------------------------------------------------------------------

## 3. Horizontal Scaling

Run multiple app servers behind load balancer.

Example:

    Nginx / ELB
      ↓
    App Server 1
    App Server 2
    App Server 3

------------------------------------------------------------------------

## 4. Caching Layer

Use Redis or Memcached for:

-   fragment cache
-   session store
-   rate limiting

------------------------------------------------------------------------

## 5. Background Processing

Heavy tasks moved to workers:

-   Sidekiq
-   Resque
-   DelayedJob

------------------------------------------------------------------------

## Interview Questions (Scaling Rails applications)

- Explain Puma's workers and threads model. How do you choose appropriate numbers for production?
- How does Rails DB connection pool interact with Puma threads? What problems arise and how to fix them?
- When scaling horizontally, what session-store and cache strategies avoid sticky sessions?
- Compare vertical vs horizontal scaling for databases and common approaches for read/write splitting.
- How and when to use Redis or Memcached for caching; discuss cache invalidation strategies.
- Explain CDNs, asset hosting, and how they reduce Rails app load.
- How to design background processing architecture (Sidekiq, separate queues, priorities) for scale?
- Discuss end-to-end observability: metrics, tracing, log aggregation for diagnosing production issues.

`