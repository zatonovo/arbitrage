/**
 * aRbitrage.js Library v0.1.1
 * This library introduces vectorization semantics into Javascript. Function
 * APIs are ported more or less verbatim from R.
 * 
 * Data frames and tables are treated as objects, where each field represents
 * a column.
 *
 * Author: Brian Lee Yung Rowe
 * Copyright: 2014 Zato Novo, LLC
 * License: LGPL-3
 *
 * Source code is available at https://github.com/zatonovo/arbitrage.js
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
  var args = map(Array.from(arguments), _vectorize)
  var max_len = max(map(args, length))
  return map(args, function(a) {
    if (length(a) == max_len) return a
    if (max_len % length(a) == 0) return rep(a, max_len % length(a))
    throw "Incompatible arrays"
  })
}

function is_vector(x) { return x instanceof Array }

function c() {
  return fold(arguments, (acc, x) => acc.concat(x), [ ])
}

function map(x, f) {
  x = _vectorize(x)
  return x.map(f)
}

/**
 * Closure has signature f(acc,x)
 */
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

/**
 * Partition a vector or data frame based on index
 * Returns a list of lists or a list of data frames in same order as index
 */
function partition(x, index) {
  if (is_vector(x)) {
    if (length(x) != length(index)) throw "Incompatible lengths in operands"
    var push_fn = (acc,x,i) => acc.set.push(x[i])
  } else if (is_dataframe(x)) {
    if (nrow(x) != length(index)) throw "Incompatible lengths in operands"
    var push_fn = (acc,x,i) => acc.set.push(select(x,i))
  } else {
    throw "Only vectors and data frames can be partitioned"
  }
  
  var ord = order(index)
  x = select(x,ord)
  var init = { key:index[0], set:[], y:[] }
  var out = fold(seq(length(x)), function(acc,i) {
    if (index[i] != acc.key) {
      acc.y.push(acc.set)
      acc.set = []
      acc.key = index[i]
    } else {
      push_fn(acc,x,i)
    }
    return acc
  }, init)
  out.y.push(out.set)

  var uniques = unique(index)
  var out_idx = cbind(uniques, seq(length(uniques)))
  var out_ord = order(uniques)
  out_idx = select(out_idx, out_ord)
  out = select(out,out_idx[1])
  return out.y
}

function tapply(x, index, fun) {
  var p = partition(x,index)
  return map(p, fun)
}

function mapply() {
  var args = Array.from(arguments)
  var fn = args.pop()
  var vs = t(do_call(_recycle,args))
  return map(vs, v => do_call(fn, v))
}

function by(data, indices, fun) {
}


/**
 * Get the keys from a Javascript object
 */
function rkeys(x) {
  return Object.keys(x)
}

/**
 * Get the values from a Javascript object
 */
function rvalues(x) {
  return map(Object.keys(x), function(k) { return x[k] })
}

/******************************* DATA FRAMES ********************************/

/**
 * Check all arguments to ensure same length
 * If last argument is a scalar character, this is the rownames
 * TODO: NOT IMPLEMENTED
 */
function dataframe() {
  var cols = Array.from(arguments)
  var last = cols[length(cols)-1]
  if (!is_vector(last) && typeof last == 'object') {
    var options = cols.pop()
  } else {
    var options = { }
  }
  if (length(cols) > 1) {
    var lens = map(cols, col => length(col))
    var delta = diff(lens)
    if (sum(select(delta,seq(length(delta)-1))) != 0)
      throw "Column lengths do not match"
  }

  if ('rownames' in options && options['rownames'] !== undefined) {
    var rownames = options.rownames
  } else {
    var rownames = seq(length(cols[0]))
  }
  if ('colnames' in options && options['colnames'] !== undefined) {
    var colnames = options.colnames
  } else {
    var colnames = seq(length(cols))
  }
  var x = { rownames:rownames }

  return fold(zip(seq(length(cols)),colnames),
    function(acc,tpl) { acc[tpl[1]] = cols[tpl[0]]; return acc }, x)
}


/**
 * Requires rownames attribute plus all columsn must be same length
 */
function is_dataframe(x) {
  if (typeof x != 'object' || !('rownames' in x)) return false
  var lens = map(colnames(x), k => length(x[k]))
  var delta = diff(lens)
  return sum(select(delta,seq(length(delta)-1))) == 0
}

function rownames(x) {
  return x.rownames
}

function colnames(x) {
  return setdiff(Object.keys(x), ['rownames'])
}

/**
 * Assumes a object represents a data frame, where each property is a column.
 */
function nrow(x) {
  return x[colnames(x)[0]].length
}

/**
 * Assumes a object represents a data frame, where each property is a column.
 */
function ncol(x) {
  return colnames(x).length
}


/**
 * Operates on JS data frames, which is an column-major table represented as
 * an object. A special column called rownames provides the rownames.
 *
 * Final column order is consistent with x
 * No checks are made to verify uniqueness of row names
 */
function rbind(x, y) {
  if (length(intersection(colnames(x), colnames(y))) > 0)
    throw "Mismatch in columns"

  return fold(colnames(y), function(acc,col) {
    acc[col].concat(y[col])
    return acc
  }, x)
}

/**
 * Joins columns of x and y
 * If x and y share column names, only x are kept
 */
function cbind(x, y, names) {
  if (is_dataframe(x) && is_dataframe(y)) {
    if (nrow(x) != nrow(y)) throw "Incompatible dimensions"
    var cols = setdiff(colnames(x), colnames(y))
    return fold(cols, function(df,col) { df[col] = y[col]; return df }, x)
  }
  if (is_vector(x) && is_vector(y)) {
    if (length(x) != length(y)) throw "Incompatible dimensions"
    return dataframe(x,y, {colnames:names})
  }
  if (is_dataframe(x) && is_vector(y)) {
    if (nrow(x) != length(y)) throw "Incompatible dimensions"
    if (names === undefined) names = ncol(x) + 1
    x[names] = y
    return x
  }
  if (is_vector(x) && is_dataframe(y)) {
    if (length(x) != nrow(y)) throw "Incompatible dimensions"
    var cols = setdiff(colnames(x), colnames(y))
    x = dataframe(x, { rownames:rownames(y) })
    return fold(cols, function(df,col) { df[col] = y[col]; return df }, x)
  }
}




/**
 * Transpose rows and columns. Effectively converts from row-major to
 * column-major and vice versa.
 *
 * TODO: Support data frames
 *
 * @param x A list of lists representing a matrix
 */
function t(x) {
  var nrow = length(x[0])
  var ncol = length(x)
  var m = map(seq(nrow), i => new Array(ncol))
  map(seq(ncol), j => map(seq(nrow), i => m[i][j] = x[j][i]))
  return m
}


/****************************** SET OPERATIONS ******************************/
function setdiff(a,b) {
  a = new Set(a)
  b = new Set(b)
  return [...a].filter(x => !b.has(x))
}

function intersection(a,b) {
  a = new Set(a)
  b = new Set(b)
  return [...a].filter(x => b.has(x))
}

function union(a,b) {
  a = new Set(a)
  map(b, bi => a.add(bi))
  return a
}

function is_equal(a,b) {
  a = _vectorize(a)
  b = _vectorize(b)
  return map(seq(length(a)), i => a[i] == b[i])
}

function all(x) {
  x = new Set(x)
  return x.size == 1 && x.has(true)
}

function any(x) {
  x = new Set(x)
  return x.has(true)
}


/**
 * Generate a sequence of repeating values
 *
 * @param x The value to repeat. If this is an array, then a single array
 *  will be returned with all elements concatenated together.
 * @param times The number of times
 */
function rep(x, times) {
  var s = seq(1,times).map(z => x)
  var o = []
  return o.concat.apply(o,s)
}


/**
 * @param from The starting value. However, if to and by are not provided,
 * then from is set to 0 and to is set to from-1. In other words, it creates
 * a 0-based sequence of length from
 * @param to The ending value. Note that if (to - from) does not divide by,
 *  to will be rounded up until there is an integer multiple of by.
 * @param by The step amount. Defaults to 1
 */
function seq(from, to, by) {
  if (typeof by === 'undefined') by = 1
  if (typeof to === 'undefined') {
    to = from - 1
    from = 0
  }

  length_out = Math.abs(Math.ceil((to - from) / by)) + 1
  if (from > to && by > 0) by = -by
  var step_fn = function(x, y) { return from + y * by; }
  return Array.apply(0, Array(length_out)).map(step_fn)
}

function length(x) {
  x = _vectorize(x)
  return x.length
}

function diff(x) {
  x = _vectorize(x)
  var ab = zip(select(x,seq(length(x))), select(x,seq(length(x)-1)))
  return map(ab, z => z[0] - z[1])
}


/**
 * Provide the indices corresponding to a sorted vector
 * @examples
 * x = [ 13,12,15,22,19,11 ]
 * order(x)
 * # [ 5,1,0,2,4,3 ]
 */
function order(x, decreasing) {
  if (decreasing === undefined) decreasing = false
  var arr = map(seq(length(x)), function(i) { return { idx:i, val:x[i] }})
  arr.sort(function(a,b) {
    if (a.val < b.val) { return -1 }
    if (a.val > b.val) { return 1 }
    return 0
  })
  var ord = map(arr, p => p.idx)
  if (decreasing) return ord.reverse()
  return ord
}


/**
 * Select a subset of an array using a vectorized form
 *
 * @examples
 * x = seq(1,10)
 * i = which(x, function(x) { return x % 2 == 0 })
 * select(x,i)
 *
 * Or shortcut with 
 * select(x, function(x) { return x % 2 == 0 })
 */
function select(x, idx) {
  if (typeof idx == 'function') { idx = which(x, idx) }
  else idx = _vectorize(idx)

  if (Array.isArray(x)) {
    if (typeof(idx[0]) == 'boolean') {
      if (length(x) != length(idx)) throw "Illegal use of boolean index"
      var reduce_fn = function(acc, v, i) {
        if (v) acc.push(x[i])
        return acc
      }
      return fold(idx, reduce_fn, [ ])
    } else if (typeof(idx[0]) == 'number') {
      return idx.map(i => x[i])
    }
    else throw "Illegal type"
  }

  if (is_dataframe(x)) {
    return fold(rkeys(x), function(acc,k) {
      var xs = acc[k]
      acc[k] = map(idx, i => xs[i])
      return acc
    }, x)
  }

  throw "x must be a vector or data frame"
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
 * which(seq(1,10), x => x % 2 == 0)
 */
function which(x, fn) {
  x = _vectorize(x)
  if (typeof fn == 'function') {
    var reduce_fn = function(acc, v, i) {
      if (fn(v)) acc.push(i)
      return acc
    }
    return fold(x, reduce_fn, [ ])
  } else if (typeof fn[0] == 'boolean') {
    var reduce_fn = function(acc, v, i) {
      if (v) acc.push(i)
      return acc
    }
    return fold(fn, reduce_fn, [ ])
  }
  else throw "Illegal type"
}

/**
 * Determine which members of x are within xs
 */
function within(x, xs) {
  x = _vectorize(x)
  xs = _vectorize(xs)
  var fn = function(a,i) {
    if (i >= length(xs)) return false
    return a == xs[i] || fn(a,i+1)
  }
  return map(x, function(i) { return fn(i,0) })
}

/**
 * Order preserving unique
 */
function unique(x) {
  x = _vectorize(x)
  vs = new Set()
  y = []
  map(x, function(xi) {
    if (vs.has(xi)) return
    vs.add(xi)
    y.push(xi)
  })
  return y
}


/**
 * Transform multiple lists into a list of tuples
 */
function zip() {
  var arrays = _vectorize(arguments)
  if (arrays.length == 1) arrays = arrays[0]

  return map(arrays[0], function(_,i) {
    return map(arrays, array => array[i])
  });
}

/**
 * @examples
 * expand_grid(seq(1,2), seq(3,5))
 */
function expand_grid(xs, ys) {
  xs = _vectorize(xs)
  ys = _vectorize(ys)
  var raw = map(ys, y => zip(_recycle(xs,y)))
  return do_call(c, raw)
}


function paste(x, collapse) {
  x = _vectorize(x)
  return x.join(collapse)
}


/**
 * One or two dimensional contingency table. y is optional.
 */
function table(x) {
  if (length(arguments) > 1) return table2.apply(null, arguments)

  return fold(x, function(acc,i) {
    if (acc[i] === undefined) acc[i] = 1
    else acc[i] = acc[i] + 1
    return acc
  }, {})
}


/**
 * x = { 'a': [ 1,1,1,2,2,3 ], 'b': [ 5,5,6,6,6,5 ] }
 * table2(x.a, x.b)
 */
function table2(x, y) {
  var keys = unique(x)
  var idx = fold(keys, function(a,b,i) { a[b] = i; return a }, { })
  var tbl = fold(unique(y), function(a,b) {
    a[b] = rep(0,length(keys))
    return a
  }, { rownames: keys })

  return fold(seq(length(x)), function(a,i) {
    var xi = x[i]
    var yi = y[i]
    a[yi][idx[xi]] += 1
    return a
  }, tbl)
}

/******************************* MATH FUNCTIONS *****************************/
function colsums(x) {
  return map(colnames(x), k => sum(x[k]))
}


function add(x,y) {
  var vs = _recycle(x,y)
  var idx = seq(vs[0].length)
  return map(idx, i => vs[0][i] + vs[1][i])
}

function subtract(x,y) {
  var vs = _recycle(x,y)
  var idx = seq(vs[0].length)
  return map(idx, i => vs[0][i] - vs[1][i])
}

function multiply(x,y) {
  var vs = _recycle(x,y)
  var idx = seq(vs[0].length)
  return map(idx, i => vs[0][i] * vs[1][i])
}

function divide(x,y) {
  var vs = _recycle(x,y)
  var idx = seq(vs[0].length)
  return map(idx, i => vs[0][i] / vs[1][i])
}

function inner_product(x,y) {
  x = _vectorize(x)
  y = _vectorize(y)
  return sum(multiply(x,y))
}

function log(x) {
  x = _vectorize(x)
  return map(x, xi => Math.log(xi))
}

function log10(x) {
  x = _vectorize(x)
  return map(x, xi => Math.log10(xi))
}

function round(x, precision) {
  if (typeof precision === 'undefined') precision = 0
  x = _vectorize(x)
  return map(x, function(y) { 
    var e = Math.pow(10,precision)
    return Math.round(y*e)/e
  })
}

function floor(x) {
  x = _vectorize(x)
  return map(x, xi => Math.floor(x))
}

function ceiling(x) {
  x = _vectorize(x)
  return map(x, xi => Math.ceil(x))
}


/**
 * Compute the sum of the values
 *
 * @param x An array of values
 */
function sum(x) {
  x = _vectorize(x)
  return fold(x, (acc, i) => acc + i, 0)
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
 * Find the max difference between values in a vector. 
 * i.e. max(x) - min(x)
 */
function maxdiff() {
  x = c.apply(null, arguments)
  return max(x) - min(x)
}

function mean(x) {
  x = _vectorize(x)
  return sum(x) / length(x)
}

function cos(x) {
  x = _vectorize(x)
  return map(x, xi => Math.cos(x))
}

function sin(x) {
  x = _vectorize(x)
  return map(x, xi => Math.sin(x))
}

function tan(x) {
  x = _vectorize(x)
  return map(x, xi => Math.tan(x))
}

function cosh(x) {
  x = _vectorize(x)
  return map(x, xi => Math.cosh(x))
}

function sinh(x) {
  x = _vectorize(x)
  return map(x, xi => Math.sinh(x))
}

function tanh(x) {
  x = _vectorize(x)
  return map(x, xi => Math.tanh(x))
}

function acos(x) {
  x = _vectorize(x)
  return map(x, xi => Math.acos(x))
}

function asin(x) {
  x = _vectorize(x)
  return map(x, xi => Math.asin(x))
}

function atan(x) {
  x = _vectorize(x)
  return map(x, xi => Math.atan(x))
}

function acosh(x) {
  x = _vectorize(x)
  return map(x, xi => Math.acosh(x))
}

function asinh(x) {
  x = _vectorize(x)
  return map(x, xi => Math.asinh(x))
}

function atanh(x) {
  x = _vectorize(x)
  return map(x, xi => Math.atanh(x))
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



function sys_date() {
  return new Date().toISOString().slice(0,10)
}
