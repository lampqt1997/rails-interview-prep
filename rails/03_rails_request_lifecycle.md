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

## Interview Questions (Rails request lifecycle)

- Walk through a Rails request from Rack middleware to response. Where are exception handlers invoked?
- What responsibilities belong in middleware vs controllers vs Rack?
- How does Rails route dispatch work? How are params parsed and permitted?
- Explain controller instance allocation per request — is it thread-safe? Why or why not?
- How do before_action / around_action / after_action callbacks affect control flow and exceptions?
- Where and how do you add custom middleware to Rails? Give examples for logging or request limiting.
- How does streaming responses (ActionController::Live) change lifecycle behavior?
- Explain how parameter parsing (JSON/form/multipart) happens and common security pitfalls.
- How do Rails and Rack handle connection hijacking or websocket upgrades?

