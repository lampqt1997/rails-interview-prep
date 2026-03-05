# Transactions and Locking

## Transaction

Ensures atomic operations.

``` ruby
User.transaction do
  ...
end
```

------------------------------------------------------------------------

## Row Lock

    SELECT ... FOR UPDATE

Rails:

``` ruby
user = User.lock.find(id)
```

This prevents concurrent modifications.

------------------------------------------------------------------------

## Atomic Update Pattern

Instead of:

    read → modify → write

Use:

``` sql
UPDATE users
SET balance = balance - 100
WHERE balance >= 100
```

Benefits:

-   prevents race conditions
-   prevents negative balance

------------------------------------------------------------------------

## Interview Questions (Transactions & locking)

- Explain ActiveRecord transactions. What does transaction do and how are rollbacks triggered?
- Compare optimistic locking (locking_version) vs pessimistic locking (SELECT ... FOR UPDATE). Use cases for each?
- What isolation levels are common in databases and how do they affect Rails transactions?
- How do you handle deadlocks and retries safely in application code?
- Describe savepoints and nested transactions in Rails. How do you rollback part of a larger transaction?
- How to implement an atomic decrement with a single SQL statement to avoid