function test_vectorize_1() {
  var x = 1
  var exp = [1]
  var act = _vectorize(x)
}

function test_vectorize_2() {
  var x = [2,3,4]
  var exp = [2,3,4]
  var act = _vectorize(x)
}

function test_vectorize_3() {
  var x = {a:1, b:2}
  var exp = [x]
  var act = _vectorize(x)
}

function test_vectorize_4() {
  var fn = function() { return arguments }
  var x = fn(1, 2, "a")
  var exp = [1, 2, "a"]
  var act = _vectorize(x)
}

function test_cartesian_product_1() {
  var a = [1,2]
  var b = [[3,4,5]
  var exp = [ [1,3],[1,4],[1,5], [2,3],[2,4],[2,5] ]
  var act = cartesian_product(a,b)
}
