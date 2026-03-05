# Senior Backend Ruby Engineer — Question Bank

This file aggregates focused interview questions from the topic files. Use this as a checklist for study.

## Ruby Core
- Explain "pass-by-value of the reference" in Ruby and give an example that distinguishes mutating vs non‑mutating methods.
- How does Ruby handle object mutability? When would you freeze an object and what are the effects?
- What's the difference between dup and clone? When does clone copy singleton methods?
- Compare block, Proc, and Lambda: differences in arity, return behavior, and use cases.
- How does method arity behave with optional and splat arguments? Show examples.
- What happens when you call return inside a Proc vs inside a Lambda vs inside a block?
- How do symbols differ from strings in memory and use cases?
- Explain Ruby's garbage collection basics (e.g., generational GC) and common tuning knobs.
- What is method_missing and when is it appropriate to use? What are the pitfalls?
- How do refinements work and when should they be used (and avoided)?

## Ruby Object Model & Metaprogramming
- Describe Ruby's class hierarchy and the role of BasicObject vs Object.
- What is a singleton class (eigenclass)? Show how and why you'd add a method to a single object.
- Compare include, extend, and prepend. How do they affect method lookup order?
- Explain Ruby's method lookup path and how ancestors are resolved.
- How do constants resolution and lookup work across modules and classes?
- What are class variables (@@) vs class instance variables (@@ vs @)? When to use each?
- Explain class_eval, instance_eval, and define_method. Provide a safe metaprogramming example.
- How does Module#prepend change behavior compared to include? Give a use case.
- What does Object.allocate do vs .new? When might you use allocate?
- Discuss trade-offs of heavy metaprogramming in production code (maintainability, performance).

## Rails Request Lifecycle & Controllers
- Walk through a Rails request from Rack middleware to response. Where are exception handlers invoked?
- What responsibilities belong in middleware vs controllers vs Rack?
- How does Rails route dispatch work? How are params parsed and permitted?
- Explain controller instance allocation per request — is it thread-safe? Why or why not?
- How do before_action / around_action / after_action callbacks affect control flow and exceptions?
- Where and how do you add custom middleware to Rails? Give examples for logging or request limiting.
- How does streaming responses (ActionController::Live) change lifecycle behavior?
- Explain how parameter parsing (JSON/form/multipart) happens and common security pitfalls.
- How do Rails and Rack handle connection hijacking or websocket upgrades?

## ActiveRecord & Lazy Loading
- Explain ActiveRecord relation lazy loading. When is SQL executed?
- What methods force a query to run (examples: each, to_a, first, count)? Differences among them?
- How does the loaded? flag work and why is it important for caching results?
- Compare where(...).first and find_by(...). How do they differ in queries and exceptions?
- When is pluck preferable to map or select? What does it return and why is it efficient?
- How do scopes chain? What pitfalls exist with default_scope regarding lazy loading?
- How do find_each and find_in_batches help with memory consumption? When not to use them?
- When running complex queries with includes, when does AR convert to JOIN vs additional queries?

## N+1 Queries & Eager Loading
- Define the N+1 query problem. How do you detect it in logs and in production?
- Compare includes, preload, and eager_load. When should you use each?
- How can conditions on associated records affect eager loading and generate unexpected SQL?
- Explain counter_cache: how it works and why it's useful to avoid N+1s.
- When might includes cause larger-than-expected memory or duplicated rows due to joins?
- Describe tools and gems (e.g., bullet) to detect N+1s and how to act on their alerts.
- How would you fix an N+1 when association is optional or filtered by a subquery?
- Discuss trade-offs between eager-loading everything vs lazy loading on demand.

## Transactions & Locking
- Explain ActiveRecord transactions. What does transaction do and how are rollbacks triggered?
- Compare optimistic locking (locking_version) vs pessimistic locking (SELECT ... FOR UPDATE). Use cases for each?
- What isolation levels are common in databases and how do they affect Rails transactions?
- How do you handle deadlocks and retries safely in application code?
- Describe savepoints and nested transactions in Rails. How do you rollback part of a larger transaction?
- How to implement an atomic decrement with a single SQL statement to avoid race conditions and negative balances?
- When should you prefer database constraints vs application-level checks for invariants?
- Explain advisory locks (database or Redis) and how you'd use them for coarse-grained synchronization.

## Idempotency & Distributed Locks
- What is an idempotency key and how would you implement idempotent POST endpoints in Rails?
- Where and how would you store idempotency results? What are common TTL strategies?
- Compare Redis-based locks (SETNX, Redlock) vs database-based locks (unique constraints, SELECT FOR UPDATE).
- Explain Redlock and critiques around correctness in distributed environments.
- How do you prevent deadlocks and ensure lock expiration is safe with clock skew?
- When might a job queue uniqueness plugin be preferable to distributed locks?
- How do you design idempotent background jobs that may be retried multiple times?
- Describe a pattern to make a payment endpoint idempotent across multiple app servers.

## Service Objects & Background Jobs
- When should you extract logic into a service object vs keeping it in a model/controller?
- Describe a typical Service Object interface and how you'd test it.
- Compare ActiveJob vs Sidekiq in terms of reliability, performance, and features.
- How do you design jobs to be idempotent and resilient to retries?
- What are best practices for serializing arguments for background jobs? When to use GlobalID?
- How do you monitor and handle failed jobs and implement exponential backoff?
- Discuss concurrency issues when multiple workers operate on the same records and mitigation strategies.
- How do you ensure sensitive data isn't leaked via job arguments or logs?

## Scaling Rails Applications & Ops
- Explain Puma's workers and threads model. How do you choose appropriate numbers for production?
- How does Rails DB connection pool interact with Puma threads? What problems arise and how to fix them?
- When scaling horizontally, what session-store and cache strategies avoid sticky sessions?
- Compare vertical vs horizontal scaling for databases and common approaches for read/write splitting.
- How and when to use Redis or Memcached for caching; discuss cache invalidation strategies.
- Explain CDNs, asset hosting, and how they reduce Rails app load.
- How to design background processing architecture (Sidekiq, separate queues, priorities) for scale?
- Discuss end-to-end observability: metrics, tracing, log aggregation for diagnosing production issues.

## Practical Exercises (recommended)
- Find and fix an N+1 in a sample codebase; measure before/after queries.
- Implement an idempotent endpoint that stores responses keyed by Idempotency-Key.
- Create a service object with proper test coverage and a corresponding background job.
- Simulate concurrent balance updates and implement an atomic SQL update to prevent negative balance.
