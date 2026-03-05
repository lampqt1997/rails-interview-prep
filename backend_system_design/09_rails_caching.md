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
