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

## Interview Questions (Ruby core concepts)

- Explain "pass-by-value of the reference" in Ruby and give an example that distinguishes mutating vs non-mutating methods.
- How does Ruby handle object mutability? When would you freeze an object and what are the effects?
- What's the difference between dup and clone? When does clone copy singleton methods?
- Compare block, Proc, and Lambda: differences in arity, return behavior, and use cases.
- How does method arity behave with optional and splat arguments? Show examples.
- What happens when you call return inside a Proc vs inside a Lambda vs inside a block?
- How do symbols differ from strings in memory and use cases?
- Explain Ruby's garbage collection basics (e.g., generational GC) and common tuning knobs.
- What is method_missing and when is it appropriate to use? What are the pitfalls?
- How do refinements work and when should they be used (and avoided)?

`