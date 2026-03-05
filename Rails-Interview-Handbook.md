# Rails Interview Handbook

A compact guide for Ruby on Rails backend interviews.

------------------------------------------------------------------------

# Ruby Core Concepts for Rails Interviews

## Ruby Parameter Passing

Ruby uses **pass-by-value of the reference**.

This means: - Objects are not copied. - The reference itself is copied.

Example:

``` ruby
def modify(arr)
  arr << 4
end

a = [1,2,3]
modify(a)
puts a
```

Output:

    [1,2,3,4]

Because both variables point to the same object.

------------------------------------------------------------------------

## Block, Proc, Lambda

### Block

A block is an anonymous function passed to a method.

``` ruby
[1,2,3].each { |x| puts x }
```

### Proc

Proc is an **objectified block**.

``` ruby
p = Proc.new { |x| puts x }
p.call(5)
```

Characteristics: - flexible arguments - return exits the surrounding
method

### Lambda

Lambda is similar to Proc but stricter.

``` ruby
l = ->(x) { x * 2 }
l.call(5)
```

Characteristics:

-   strict arity
-   return only exits the lambda

------------------------------------------------------------------------

## Arity

Arity = number of arguments a function expects.

``` ruby
def test(a,b)
end
```

arity = 2

Lambda enforces arity while Proc does not.

------------------------------------------------------------------------

# Ruby Object Model

Ruby is a **pure object-oriented language**.

Everything is an object.

Example:

``` ruby
1.class
# => Integer
```

## Class hierarchy

    BasicObject
      |
    Object
      |
    Module
      |
    Class

Example:

``` ruby
Integer.superclass
# => Numeric
```

------------------------------------------------------------------------

## Instance Method vs Class Method

### Instance method

Belongs to object instance.

``` ruby
class User
  def hello
    "hi"
  end
end
```

### Class method

Belongs to class itself.

``` ruby
class User
  def self.count_users
    10
  end
end
```

------------------------------------------------------------------------

## Singleton Class

Ruby allows methods on a **single object**.

``` ruby
u = User.new

def u.special
  "only this object"
end
```

This method lives in the object's **singleton class**.

------------------------------------------------------------------------

# Rails Request Lifecycle

When a request hits a Rails app:

    Client
     ↓
    Rack Middleware
     ↓
    Rails Router
     ↓
    Controller instance created
     ↓
    before_action callbacks
     ↓
    Controller action
     ↓
    render / redirect
     ↓
    Response

## Middleware Stack

Middleware wraps around the application.

Execution order:

    A before
      B before
        Controller
      B after
    A after

Middleware configured in:

    config/application.rb
    config/environments/*

------------------------------------------------------------------------

# ActiveRecord Lazy Loading

ActiveRecord relations are **lazy**.

Example:

``` ruby
users = User.where(active: true)
```

No query executed yet.

Query runs when data is needed:

    users.each
    users.to_a
    users.first

------------------------------------------------------------------------

## loaded? flag

Relation has a property:

    loaded?

Before loading:

    false

After query execution:

    true

Subsequent iterations use cached records.

------------------------------------------------------------------------

# N+1 Query Problem

Example:

``` ruby
users = User.where(active: true)

users.each do |u|
  puts u.posts.count
end
```

If there are 100 users:

Queries:

    1 query for users
    100 queries for posts

Total:

    101 queries

------------------------------------------------------------------------

## Fix with eager loading

    User.includes(:posts)

This generates:

    SELECT users...
    SELECT posts WHERE user_id IN (...)

Total queries:

    2

------------------------------------------------------------------------

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

# Rails Architecture Best Practices

## Controller Responsibilities

Controllers should:

-   receive request
-   validate params
-   call service
-   render response

Avoid heavy business logic.

------------------------------------------------------------------------

## Service Objects

Used for business logic.

Example:

    app/services/withdraw_service.rb

``` ruby
class WithdrawService
  def self.call(user, amount)
    User.transaction do
      user.lock!
      user.balance -= amount
      user.save!
    end
  end
end
```

------------------------------------------------------------------------

## Background Jobs

Used for slow tasks:

-   sending email
-   processing files
-   external APIs

Example:

``` ruby
SendEmailJob.perform_later(user.id)
```

Workers execute jobs asynchronously.

------------------------------------------------------------------------

# Rails Caching

Caching improves performance by avoiding repeated computation or
database queries.

## Types of Caching in Rails

### 1. Page Cache (rarely used now)

Caches the entire HTML page.

### 2. Action Cache

Caches controller responses.

### 3. Fragment Cache

Caches part of a view.

Example:

``` erb
<% cache @post do %>
  <%= render @post %>
<% end %>
```

Rails will store this fragment in cache store (Redis, Memcached, etc).

------------------------------------------------------------------------

## Russian Doll Caching

Nested caching strategy.

Example:

``` erb
<% cache @posts do %>
  <% @posts.each do |post| %>
    <% cache post do %>
      <%= render post %>
    <% end %>
  <% end %>
<% end %>
```

If a single post changes, only that fragment is invalidated.

------------------------------------------------------------------------

## Cache Store Options

Common stores:

-   Redis
-   Memcached
-   MemoryStore

Example configuration:

``` ruby
config.cache_store = :redis_cache_store
```

------------------------------------------------------------------------

# Sidekiq and Background Jobs Deep Dive

Background jobs handle slow or asynchronous tasks.

Examples:

-   sending emails
-   processing images
-   calling external APIs

------------------------------------------------------------------------

## Why Background Jobs

Without background jobs:

    request waits for task to finish
    slow response
    poor user experience

With background jobs:

    enqueue job → worker processes later
    fast API response

------------------------------------------------------------------------

## Sidekiq Architecture

Components:

    Rails App
      ↓
    Redis Queue
      ↓
    Sidekiq Worker

Jobs are pushed to Redis and processed by worker processes.

------------------------------------------------------------------------

## Example Job

``` ruby
class SendEmailJob
  include Sidekiq::Worker

  def perform(user_id)
    UserMailer.welcome(user_id).deliver_now
  end
end
```

Enqueue job:

``` ruby
SendEmailJob.perform_async(user.id)
```

------------------------------------------------------------------------

## Important Concepts

### Retry

Sidekiq retries failed jobs automatically.

### Dead Job Queue

Jobs that fail repeatedly go to dead queue.

### Concurrency

Sidekiq workers process many jobs in parallel threads.

------------------------------------------------------------------------

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
