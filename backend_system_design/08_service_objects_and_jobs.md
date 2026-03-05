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

## Interview Questions (Service objects & background jobs)

- When should you extract logic into a service object vs keeping it in a model/controller?
- Describe a typical Service Object interface and how you'd test it.
- Compare ActiveJob vs Sidekiq in terms of reliability, performance, and features.
- How do you design jobs to be idempotent and resilient to retries?
- What are best practices for serializing arguments for background jobs? When to use GlobalID?
- How do you monitor and handle failed jobs and implement exponential backoff?
- Discuss concurrency issues when multiple workers operate on the same records and mitigation strategies.
- How do you ensure sensitive data isn't leaked via job arguments or logs?

`