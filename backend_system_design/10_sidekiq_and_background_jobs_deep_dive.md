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
