JuiceR
======

For those working with data and looking to perform data visualization,
the concept of vectorization is extremely useful. The short definition
of vectorization is that all scalars are actually vectors of length 1.
Additionally, functions are vector-aware, so operations like addition
natively perform element-wise addition while operations like max
natively know how to operate on an array.

Since Javascript doesn't support vectors out of the box, an external library
must do the work. JuiceR does just this, while also providing tools to
work with sequences in general as well as sample spaces and probability
distributions.

Sequence Operations
===================

Sequences
---------
Definition: ```seq(from, to, by=1)```

A sequence is any regularly spaced set of numbers, such as ```[1,2,3,4,5]```.
To create this integer sequence, use ```seq(1,5)```.
A decreasing sequence is also possible using ```seq(5,1)```. 

Suppose instead that you want a step size greater than 1. Then explicitly 
set the step size with the ```by``` argument: ```seq(1,18, 3)```. The
```by``` argument can also be used to specify non-integer step sizes,
such as ```seq(1,5, 0.2)```.

Note that if the step size does not yield a value coincident with the 
```to``` value, the number of elements is rounded up such that ```to```
is within the bounds of the resulting array: ```seq(1,20, 3)```.

Replication
-----------
Definition: ```rep(x, times)```

The ```rep``` function replicates the input argument a specified 
number of times. For example to create an array of four 1s, use
```rep(1,4)```.
It is possible to pass an array as an argument, in which case the result
is a single array with all elements concatenated: ```rep([1,2,3], 4)```.

Selections
----------
Definition: ```select(x, idx)```
Definition: ```which(x, fn)```

Algebra
=======

Arithmetic
----------
Definition: ```add(x,y)```
Definition: ```multiply(x,y)```

Summation operator
------------------
Definition: ```sum(x)```
Definition: ```cumsum(x)```

Product operator
----------------
Definition: ```prod(x)```
Definition: ```cumprod(x)```

Dot product
-----------
Definition: ```inner_prod(x,y)```


Minima and maxima
-----------------
Definition: ```min(x)```
Definition: ```max(x)```



Probability and Sampling
========================
Definition: ```sample(x, size, prob=cumsum(rep(1/x,x)))```

The sample function provides a way to make repeated draws from a sample
space with replacement.

```
x = seq(1,20)
y = sample(x, 100)
```

You might then want to draw the results using d3.js.

Credits
=======
Author: Brian Lee Yung Rowe

