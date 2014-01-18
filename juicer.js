/**
 * JuiceR Library v0.1.0
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
  return x.reduce(reduce_fn, [ ])
}

/******************************* MATH FUNCTIONS *****************************/

function add(x,y) {
  var vs = _recycle(x,y)
  var idx = seq(0, vs[0].length-1)
  return idx.map(function(i) { return vs[0][i] + vs[1][i] })
}

function multiply(x,y) {
  var vs = _recycle(x,y)
  var idx = seq(0, vs[0].length-1)
  return idx.map(function(i) { return vs[0][i] * vs[1][i] })
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
  return x.reduce(function(acc, i) { return acc + i }, 0)
}

/**
 * Compute the product of the values
 *
 * @param x An array of values
 */
function prod(x) {
  x = _vectorize(x)
  return x.reduce(function(acc, i) { return acc * i }, 0)
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
function min(x) {
  x = _vectorize(x)
  return Math.min.apply(null, x)
}

/**
 * Find the maximum within an array
 */
function max(x) {
  x = _vectorize(x)
  return Math.max.apply(null, x)
}


/******************************* PROBABILITY ********************************/

/**
 * Draw from a sample space with replacement.
 *
 * @param x The sample space
 * @param size The number of samples to draw
 * @param prob Cumulative probabilities. The last value must be 1
 */
function sample(x, size, prob) {
  if (typeof prob === 'undefined') prob = cumsum(rep(1/x, x))
  if (x.length != prob.length) throw "Length of x and prob must be equal"
  if (prob[prob.length-1] != 1) throw "Probabilities must be cumulative"
  var sample_one = function(x, prob) {
    var p = Math.random()
    //console.log(p)
    var v = seq(1,x.length).reduce(function(acc,i) { 
      if (p <= prob[i-1]) acc.push(x[i-1])
      return acc
    },[])
    return v[0]
  }
  return seq(1,size).map(function(z) { return sample_one(x, prob) })
}

function runif(n, min, max) {
  if (typeof min === 'undefined') min = 0
  if (typeof max === 'undefined') max = 1
  return seq(1,n).map(function(x) { return min + (max - min) * Math.random() })
}


function zip(arrays) {
  return arrays[0].map(function(_,i){
    return arrays.map(function(array){return array[i]})
  });
}

