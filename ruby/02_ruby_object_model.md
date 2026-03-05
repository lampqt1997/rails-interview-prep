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

## Interview Questions (Ruby object model)

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

`