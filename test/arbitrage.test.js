function test_any_with_true() {
  var x = [ true, false, true, false, false ]
  return any(x) == true
}

function test_any_no_true() {
  var x = [ false, false, false, false, false ]
  return any(x) == false
}

// Currently undefined behavior
function test_any_empty_vector() {
  return false
}

function test_all_true() {
  var x = [ true, true, true, true, true ]
  return all(x) == true
}

function test_all_some_true() {
  var x = [ true, false, true, false, false ]
  return all(x) == false
}

function test_all_no_true() {
  var x = [ false, false, false, false, false ]
  return all(x) == false
}


function test_vectorize_1() {
  var x = 1
  var exp = [1]
  var act = _vectorize(x)
  return all(is_equal(act,exp))
}

function test_vectorize_2() {
  var x = [2,3,4]
  var exp = [2,3,4]
  var act = _vectorize(x)
  return all(is_equal(act,exp))
}

function test_vectorize_3() {
  var x = {a:1, b:2}
  var exp = [x]
  var act = _vectorize(x)
  return all(is_equal(act,exp))
}

function test_vectorize_4() {
  var fn = function() { return arguments }
  var x = fn(1, 2, "a")
  var exp = [1, 2, "a"]
  var act = _vectorize(x)
  return all(is_equal(act,exp))
}


function test_unique() {
  var x = [5,6,4,7,4,3,2,7]
  var act = unique(x)
  var exp = [5,6,4,7,3,2]
  return all(is_equal(act,exp))
}


function test_recycle_2_args() {
  var act = _recycle([1,2], [1,2,3,4])
  var exp = [ [1,2,1,2], [1,2,3,4] ]
  return length(act) == length(exp) &&
    all(map(seq(length(exp)), i => all(is_equal(act[i],exp[i])) ))
}

function test_recycle_3_args() {
  var act = _recycle([1,2], [1,2,3,4], 3)
  var exp = [ [1,2,1,2], [1,2,3,4], [3,3,3,3] ]
  return length(act) == length(exp) &&
    all(map(seq(length(exp)), i => all(is_equal(act[i],exp[i])) ))
}



function test_seq_int() {
  var act = seq(10)
  var exp = [0,1,2,3,4,5,6,7,8,9]
  return all(is_equal(act,exp))
}


function test_order_increasing() {
  var x = [ 13,12,15,22,19,11 ]
  var act = order(x)
  var exp = [ 5,1,0,2,4,3 ]
  return all(is_equal(act,exp))
}

function test_order_decreasing() {
  var x = [ 13,12,15,22,19,11 ]
  var act = order(x, true)
  var exp = [ 3,4,2,0,1,5 ]
  return all(is_equal(act,exp))
}


function test_which() {
  var x = seq(6)
  var act = which(x, xi => xi > 3)
  var exp = [ 4,5 ]
  return all(is_equal(act,exp))
}

function test_select_vector() {
  var x = add(seq(6), 10)
  var act = select(x, xi => xi > 13)
  var exp = [ 14,15 ]
  return all(is_equal(act,exp))
}

function test_select_dataframe() {
  var df = { rownames:['a','b','c'], x:[2,3,1], y:[7,8,9] }
  var act = select(df, order(df.x))
  var exp = { rownames:['c','a','b'], x:[1,2,3], y:[9,7,8] }
  return all(map(rkeys(exp), k => all(is_equal(act[k],exp[k])) ))
}


function test_is_dataframe() {
  var df = { rownames:['a','b','c'], x:[1,2,3], y:[7,8,9] }
  var act = is_dataframe(df)
  var exp = true
  return act == exp
}

function test_dataframe_one_col() {
  var act = dataframe([1,1,2,3])
  return all(is_equal(act.rownames, seq(4))) &&
    all(is_equal(act[0], [1,1,2,3]))
}

function test_dataframe_two_col() {
  var act = dataframe([1,2,3], [4,5,6])
  var exp = { rownames:[0,1,2], 0:[1,2,3], 1:[4,5,6] }
  return all(map(rkeys(exp), k => all(is_equal(act[k],exp[k])) ))
}

function test_dataframe_two_col_named_cols() {
  var act = dataframe([1,2,3], [4,5,6], {colnames:['a','b']})
  var exp = { rownames:[0,1,2], a:[1,2,3], b:[4,5,6] }
  return all(map(rkeys(exp), k => all(is_equal(act[k],exp[k])) ))
}

function test_partition() {
  var x = [ 1,2,3,4,5,6 ]
  var i = [ 'b','b','c','c','c','a' ]
  var act = partition(x,i)
  var exp = [ [1,2], [3,4,5], [6] ]
  return length(act) == length(exp) &&
    all(map(seq(length(exp)), i => all(is_equal(act[i],exp[i])) ))
}


// 1 4
// 2 5
// 3 6
function test_t_1() {
  var x = [ [1,2,3], [4,5,6] ]
  var act = t(x)
  var exp = [ [1,4], [2,5], [3,6] ]
  return length(act) == length(exp) &&
    all(map(seq(length(exp)), i => all(is_equal(act[i],exp[i])) ))
}

function test_mapply_2_args() {
  var act = mapply([1,2,3], [4,4,5,5,6,6], (a,b) => a + b)
  var exp = [5,6,8,6,8,9]
  return all(is_equal(act,exp))
}


function test_cartesian_product_1() {
  var a = [1,2]
  var b = [[3,4,5]]
  var exp = [ [1,3],[1,4],[1,5], [2,3],[2,4],[2,5] ]
  var act = cartesian_product(a,b)
}
