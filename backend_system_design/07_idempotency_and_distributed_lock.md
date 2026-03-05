# Idempotency and Distributed Locks

## Idempotency Key

Used to prevent duplicate requests.

Example:

    POST /payments
    Idempotency-Key: abc123

Server stores result of the first request.

Duplicate requests return the same response.

------------------------------------------------------------------------

## Distributed Lock

Used when multiple servers process the same job.

Common solutions:

-   Redis lock
-   database unique constraint
-   job queue uniqueness

Example:

    SETNX lock_key

------------------------------------------------------------------------

## Interview Questions (Idempotency & distributed locks)

- What is an idempotency key and how would you implement idempotent POST endpoints in Rails?
- Where and how would you store idempotency results? What are common TTL strategies?
- Compare Redis-based locks (SETNX, Redlock) vs database-based locks (unique constraints, SELECT FOR UPDATE).
- Explain Redlock and critiques around correctness in distributed environments.
- How do you prevent deadlocks and ensure lock expiration is safe with clock skew?
- When might a job queue uniqueness plugin be preferable to distributed locks?
- How do you design idempotent background jobs that may be retried multiple times?
- Describe a pattern to make a payment endpoint idempotent across multiple app servers.

