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

## Interview Questions (N+1 queries & eager loading)

- Define the N+1 query problem. How do you detect it in logs and in production?
- Compare includes, preload, and eager_load. When should you use each?
- How can conditions on associated records affect eager loading and generate unexpected SQL?
- Explain counter_cache: how it works and why it's useful to avoid N+1s.
- When might includes cause larger-than-expected memory or duplicated rows due to joins?
- Describe tools and gems (e.g., bullet) to detect N+1s and how to act on their alerts.
- How would you fix an N+1 when association is optional or filtered by a subquery?
- Discuss trade-offs between eager-loading everything vs lazy loading on demand.

`