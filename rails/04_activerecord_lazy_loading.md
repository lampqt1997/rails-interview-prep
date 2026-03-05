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

## Interview Questions (ActiveRecord lazy loading)

- Explain ActiveRecord relation lazy loading. When is SQL executed?
- What methods force a query to run (examples: each, to_a, first, count)? Differences among them?
- How does the loaded? flag work and why is it important for caching results?
- Compare where(...).first and find_by(...). How do they differ in queries and exceptions?
- When is pluck preferable to map or select? What does it return and why is it efficient?
- How do scopes chain? What pitfalls exist with default_scope regarding lazy loading?
- How do find_each and find_in_batches help with memory consumption? When not to use them?
- When running complex queries with includes, when does AR convert to JOIN vs additional queries?

`