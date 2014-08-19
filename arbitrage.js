/**
 * aRbitrage.js Library v0.1.1
 * This library introduces vectorization semantics into Javascript. Function
 * APIs are ported more or less verbatim from R.
 *
 * Author: Brian Lee Yung Rowe
 * Copyright: 2014 Zato Novo, LLC
 * License: LGPL-3
 *
 * Source code is available at https://github.com/zatonovo/juicer
 */

/**
 * Ensure a value is an array
 */
function _vectorize(x) {
  if (x instanceof Array) return x
  if (x.length !== undefined) return Array.prototype.slice.call(x)
  return [x]
}

/**
 * Ensure vector lengths are compatible
 */
function _recycle(x,y) {
  x = _vectorize(x)
  y = _vectorize(y)
  if (x.length == y.length) return [x,y]
  if (x.length % y.length == 0) return [x, rep(y, x.length / y.length)]
  if (y.length % x.length == 0) return [rep(x, y.length / x.length), y]
  throw "Incompatible arrays"
}

function map(x, f) {
  x = _vectorize(x)
  return x.map(f)
}

function fold(x, f, acc) {
  x = _vectorize(x)
  return x.reduce(f, acc)
}

function filter(x, pred) {
  x = _vectorize(x)
  return x.filter(pred)
}


function do_call(f, args) {
  return f.apply(null, args)
}

function c() {
  return fold(arguments, function(acc, x) { return acc.concat(x) }, [ ])
}

/**
 * Generate a sequence of repeating values
 *
 * @param x The value to repeat. If this is an array, then a single array
 *  will be returned with all elements concatenated together.
 * @param times The number of times
 */
function rep(x, times) {
  var s = seq(1,times).map(function(z) { return x })
  var o = []
  return o.concat.apply(o,s)
}


/**
 * @param from The starting value
 * @param to The ending value. Note that if (to - from) does not divide by,
 *  to will be rounded up until there is an integer multiple of by.
 * @param by The step amount. Defaults to 1
 */
function seq(from, to, by) {
  if (typeof by === 'undefined') by = 1
  length_out = Math.abs(Math.ceil((to - from) / by)) + 1
  if (from > to && by > 0) by = -by
  var step_fn = function(x, y) { return from + y * by; }
  return Array.apply(0, Array(length_out)).map(step_fn)
}


/**
 * Select a subset of an array using a vectorized form
 *
 * @examples
 * x = seq(1,10)
 * i = which(x, function(x) { return x % 2 == 0 })
 * select(x,i)
 */
function select(x, idx) {
  x = _vectorize(x)
  idx = _vectorize(idx)
  return idx.map(function(i) { return x[i] })
}

/**
 * Get the array indices corresponding to elements that satisfy a
 * logical expression represented in the function.
 *
 * @param x An array
 * @param fn A function that takes a scalar and returns a boolean value
 *
 * @examples
 * // Find indices associated with even numbers in sequence
 * which(seq(1,10), function(x) { return x % 2 == 0 })
 */
function which(x, fn) {
  x = _vectorize(x)
  var reduce_fn = function(acc, v, i) {
    if (fn(v)) acc.push(i)
    return acc
  }
  return fold(x, reduce_fn, [ ])
}

function unique(x) {
  x = _vectorize(x)
  return Object.keys(x.reduce(function(r,v){ return r[v]=1,r; },{}));
}

function zip() {
  var arrays = _vectorize(arguments)
  if (arrays.length == 1) arrays = arrays[0]

  return map(arrays[0], function(_,i) {
    return map(arrays, function(array) {return array[i]})
  });
}

/**
 * @examples
 * expand_grid(seq(1,2), seq(3,5))
 */
function expand_grid(xs, ys) {
  xs = _vectorize(xs)
  ys = _vectorize(ys)
  var raw = map(ys, function(y) { return zip(_recycle(xs,y)) })
  return do_call(c, raw)
}

function keys(x) {
  return Object.keys(x)
}

function values(x) {
  return map(Object.keys(x), function(k) { return x[k] })
}


function table(x) {
  return fold(x, function(acc,i) {
    if (acc[i] === undefined) acc[i] = 1
    else acc[i] = acc[i] + 1
    return acc
  }, {})
}

function paste(x, collapse) {
  x = _vectorize(x)
  return x.join(collapse)
}

/******************************* MATH FUNCTIONS *****************************/

function add(x,y) {
  var vs = _recycle(x,y)
  var idx = seq(0, vs[0].length-1)
  return map(idx, function(i) { return vs[0][i] + vs[1][i] })
}

function multiply(x,y) {
  var vs = _recycle(x,y)
  var idx = seq(0, vs[0].length-1)
  return map(idx, function(i) { return vs[0][i] * vs[1][i] })
}

function inner_product(x,y) {
  x = _vectorize(x)
  y = _vectorize(y)
  return sum(multiply(x,y))
}

/**
 * Compute the sum of the values
 *
 * @param x An array of values
 */
function sum(x) {
  x = _vectorize(x)
  return fold(x, function(acc, i) { return acc + i }, 0)
}

/**
 * Compute the product of the values
 *
 * @param x An array of values
 */
function prod(x) {
  x = _vectorize(x)
  return fold(x, function(acc, i) { return acc * i }, 0)
}

/**
 * Compute the cumulative sum
 *
 * @param x An array of values
 */
function cumsum(x) {
  x = _vectorize(x)
  var y = 0
  return x.map(function(i) { y += i; return y })
}

/**
 * Compute the cumulative product
 *
 * @param x An array of values
 */
function cumprod(x) {
  x = _vectorize(x)
  var y = 0
  return x.map(function(i) { y *= i; return y })
}


/**
 * Find the minimum within an array
 */
function min() {
  x = c.apply(null, arguments)
  return Math.min.apply(null, x)
}

/**
 * Find the maximum within an array
 */
function max() {
  x = c.apply(null, arguments)
  return Math.max.apply(null, x)
}

/**
 * Get the cartesian product of two vectors as though they were sets
 */
function cartesian_product(x,y) {
  x = _vectorize(x)
  y = _vectorize(y)
  return fold(x, function(a,b) { return c(a,zip(_recycle(b,y))) }, [ ])
}

/******************************* PROBABILITY ********************************/

/**
 * Draw from a sample space with replacement.
 *
 * @param x The sample space
 * @param size The number of samples to draw
 * @param prob The probabilities, which must sum to 1
 * @param replace Whether to use replacement. The default is true
 * @examples
 * sample(seq(1,10), 20)
 * sample(seq(1,10), 6, undefined, false)
 */
function sample(x, size, prob, replace) {
  if (typeof prob === 'undefined') prob = rep(1/x.length, x.length)
  if (typeof replace === 'undefined') replace = true
  x = _vectorize(x)
  prob = _vectorize(prob)
  if (x.length != prob.length) throw "Length of x and prob must be equal"
  if (Math.abs(1 - sum(prob)) > 1e-12) {
    console.log("sum(prob) = "+sum(prob))
    throw "Sum of probabilities must equal 1"
  }
  var sample_one = function(prob) {
    var p = Math.random()
    var v = fold(seq(1, prob.length), function(acc,i) { 
      if (p <= prob[i-1]) acc.push(i-1)
      return acc
    },[])
    return v[0]
  }
  if (replace) {
    return map(seq(1,size),
      function(z) { return x[sample_one(cumsum(prob))] })
  } else {
    return fold(seq(1,size), function(a, z) {
      var idx = sample_one(cumsum(prob))
      var p = prob[idx]
      a.push(x[idx])
      x.splice(idx,1)
      prob.splice(idx,1)
      prob = multiply(multiply(1/p, prob), 1/prob.length)
      return a
    }, [ ])
  }
}

function runif(n, min, max) {
  if (typeof min === 'undefined') min = 0
  if (typeof max === 'undefined') max = 1
  return map(seq(1,n), function(x) { return min + (max - min) * Math.random() })
}


