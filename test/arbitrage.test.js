import test from 'ava'
import * as r from '../arbitrage.js'


/******************************* CORE FUNCTIONS *****************************/
test('vectorize 1', t => {
  var x = 1
  var exp = [1]
  var act = r._vectorize(x)
  t.true(r.all(r.is_equal(act,exp)))
})

test('vectorize 2', t => {
  var x = [2,3,4]
  var exp = [2,3,4]
  var act = r._vectorize(x)
  t.true(r.all(r.is_equal(act,exp)))
})

test('vectorize 3', t => {
  var x = {a:1, b:2}
  var exp = [x]
  var act = r._vectorize(x)
  t.true(r.all(r.is_equal(act,exp)))
})

test('vectorize 4', t => {
  var fn = function() { return arguments }
  var x = fn(1, 2, "a")
  var exp = [1, 2, "a"]
  var act = r._vectorize(x)
  t.true(r.all(r.is_equal(act,exp)))
})


test('recycle scalar', t=> {
  var act = r._recycle(r.seq(3), 10)
  var exp = [ [0,1,2], [10,10,10] ]
  t.true(r.all(r.is_equal_cols(act,exp)))
})

test('recycle 2 args', t => {
  var act = r._recycle([1,2], [1,2,3,4])
  var exp = [ [1,2,1,2], [1,2,3,4] ]
  t.true(r.all(r.is_equal_cols(act,exp)))
})

test('recycle 3 args', t => {
  var act = r._recycle([1,2], [1,2,3,4], 3)
  var exp = [ [1,2,1,2], [1,2,3,4], [3,3,3,3] ]
  t.true(r.all(r.is_equal_cols(act,exp)))
})



/****************************** VECTORIZATION *******************************/
test('tapply vector int index', t => {
  var x = [ 1,2,3,4,5 ]
  var y = [ 1,1,2,2,2 ]
  var act = r.tapply(x,y, r.sum)
  var exp = [ 3, 12 ]
  t.true(r.all(r.is_equal(act,exp)))
})

test('tapply vector char index', t => {
  var x = [ 1,2,3,4,5 ]
  var y = [ 'a','a', 'b','b','b' ]
  var act = r.tapply(x,y, r.sum)
  var exp = [ 3, 12 ]
  t.true(r.all(r.is_equal(act,exp)))
})


test.todo('tapply dataframe int index')
test.todo('tapply dataframe char index')


test('mapply 2 args', t => {
  var x = [ 1,2,3,4 ]
  var y = [ 2,3,4,5 ]
  var exp = r.sqrt(r.add(r.pow(x,2), r.pow(y,2)))
  var act = r.mapply(x,y, (a,b) => (a**2 + b**2)**.5)
  //console.log("exp: "+exp)
  //console.log("act: "+act)
  t.true(r.all(r.is_equal(act,exp)))
})

test('mapply 2 args with recycling', t => {
  var act = r.mapply([1,2,3], [4,4,5,5,6,6], (a,b) => a + b)
  var exp = [5,6,8,6,8,9]
  t.true(r.all(r.is_equal(act,exp)))
})

test.todo('mapply 3 args')


// ADD MORE TEST CASES
test.todo('fold 1')

// ADD MORE TEST CASES
test.todo('filter 1')



/***************************** VECTOR OPERATIONS ****************************/

test('seq int', t => {
  var act = r.seq(10)
  var exp = [0,1,2,3,4,5,6,7,8,9]
  t.true(r.all(r.is_equal(act,exp)))
})

test.todo('seq using from/to')
test.todo('seq using from/to/by')


test.todo('rep scalar')
test.todo('rep vector')


test.todo('length vector')
test.todo('length object')



// ADD MORE TEST CASES
test('order increasing ints', t => {
  var x = [ 13,12,15,22,19,11 ]
  var act = r.order(x)
  var exp = [ 5,1,0,2,4,3 ]
  t.true(r.all(r.is_equal(act,exp)))
})


// ADD MORE TEST CASES
test('order decreasing ints', t => {
  var x = [ 13,12,15,22,19,11 ]
  var act = r.order(x, true)
  var exp = [ 3,4,2,0,1,5 ]
  t.true(r.all(r.is_equal(act,exp)))
})



// ADD MORE TEST CASES
test('unique', t => {
  var x = [5,6,4,7,4,3,2,7]
  var act = r.unique(x)
  var exp = [5,6,4,7,3,2]
  t.true(r.all(r.is_equal(act,exp)))
})



/****************************** SET OPERATIONS ******************************/

test('any with true', t => {
  var x = [ true, false, true, false, false ]
  t.true(r.any(x) == true)
})

test('any no true', t => {
  var x = [ false, false, false, false, false ]
  t.true(r.any(x) == false)
})

// TOOD: Currently undefined behavior. Need to define before testing.
test.todo('any empty vector')

test('all true', t => {
  var x = [ true, true, true, true, true ]
  t.true(r.all(x) == true)
})

test('all some true', t => {
  var x = [ true, false, true, false, false ]
  t.true(r.all(x) == false)
})

test('all no true', t => {
  var x = [ false, false, false, false, false ]
  t.true(r.all(x) == false)
})


test.todo('is_equal 1')
test.todo('is_equal throws error with mismatched lengths')

test.todo('is_equal_cols 1')
test.todo('is_equal_cols throws error with mismatched lengths')


test.todo('setdiff 1')
test.todo('setdiff b subset of a')
test.todo('setdiff a subset of b')
test.todo('setdiff a and b disjoint')

test.todo('intersection b subset of a')
test.todo('intersection a subset of b')
test.todo('intersection a and b disjoint')
test.todo('intersection a = b')

test.todo('union b subset of a')
test.todo('union a subset of b')
test.todo('union a and b disjoint')
test.todo('union a = b')

test.todo('within some x in xs')
test.todo('within all x in xs')
test.todo('within no x not in xs')



// ADD MORE TEST CASES
test('cartesian product 1', t => {
  var a = [1,2]
  var b = [3,4,5]
  var exp = [ [1,3],[1,4],[1,5], [2,3],[2,4],[2,5] ]
  var act = r.cartesian_product(a,b)
  t.true(r.all(r.is_equal_cols(act,exp)))
})



/******************************** SUBSETTING ********************************/

test('which using predicate', t => {
  var x = r.seq(6)
  var act = r.which(x, xi => xi > 3)
  var exp = [ 4,5 ]
  t.true(r.all(r.is_equal(act,exp)))
})

test.todo('which using boolean vector')
test.todo('which using boolean vector with wrong length')
test.todo('which with no true')


test('select vector', t => {
  var x = r.add(r.seq(6), 10)
  var act = r.select(x, xi => xi > 13)
  var exp = [ 14,15 ]
  t.true(r.all(r.is_equal(act,exp)))
})

test('select dataframe', t => {
  var df = { rownames:['a','b','c'], x:[2,3,1], y:[7,8,9] }
  var act = r.select(df, r.order(df.x))
  var exp = { rownames:['c','a','b'], x:[1,2,3], y:[9,7,8] }
  t.true(r.all(r.map(r.rkeys(exp), k => r.all(r.is_equal(act[k],exp[k])) )))
})


// ADD MORE TEST CASES
test.todo('select vector using predicate')


test('partition vector semi-ordered', t => {
  var x = [ 1,2,3,4,5,6 ]
  var i = [ 'b','b','c','c','c','a' ]
  var act = r.partition(x,i)
  var exp = [ [1,2], [3,4,5], [6] ]
  t.true(r.all(r.is_equal_cols(act,exp)))
})

test('partition vector random order', t => {
  var x = [ 1,2,3,4,5,6 ]
  var i = [ 'b','c','c','b','a','c' ]
  var act = r.partition(x,i)
  var exp = [ [1,4], [2,3,6], [5] ]
  t.true(r.all(r.is_equal_cols(act,exp)))
})


// ADD MORE TEST CASES
test('partition dataframe', t => {
  var x = r.dataframe([1,2,3,4,5], [1,1,2,2,3])
  var exp = [
    r.dataframe([1,2], [1,1]),
    r.dataframe([3,4], [2,2]),
    r.dataframe([5], [3])
  ]
  var act = r.partition(x, x[1])
  t.true(r.nrow(x) == 5) // Guarantee no side effects
  r.map(r.seq(r.length(exp)),
    i => t.true(r.all(r.is_equal_cols(act[i],exp[i]))) )
})



/********************************* MATRICES *********************************/

test.todo('is_matrix returns false when non vector')
test.todo('is_matrix returns false when inconsistent lengths')

test('t matrix', t => {
  var x = [ [1,2,3], [4,5,6] ]
  var act = r.t(x)
  var exp = [ [1,4], [2,5], [3,6] ]
  t.true(r.all(r.is_equal_cols(act,exp)))
})

test.todo('t JSON list of records')

// Ensure row names and column names are swapped
test.todo('t dataframe')



/******************************** DATA FRAMES *******************************/
test('dataframe one col', t => {
  var act = r.dataframe([1,1,2,3])
  t.true(r.all(r.is_equal(act.rownames, r.seq(4))) &&
    r.all(r.is_equal(act[0], [1,1,2,3])))
})

test('dataframe two col', t => {
  var act = r.dataframe([1,2,3], [4,5,6])
  var exp = { rownames:[0,1,2], 0:[1,2,3], 1:[4,5,6] }
  t.true(r.all(r.map(r.rkeys(exp), k => r.all(r.is_equal(act[k],exp[k])) )))
})

test('dataframe two col named cols', t => {
  var act = r.dataframe([1,2,3], [4,5,6], {colnames:['a','b']})
  var exp = { rownames:[0,1,2], a:[1,2,3], b:[4,5,6] }
  t.true(r.all(r.map(r.rkeys(exp), k => r.all(r.is_equal(act[k],exp[k])) )))
})

test.todo('dataframe two col named rows')

test.todo('dataframe two col named rows and cols')


test('is_dataframe', t => {
  var df = { rownames:['a','b','c'], x:[1,2,3], y:[7,8,9] }
  var act = r.is_dataframe(df)
  var exp = true
  t.true(act == exp)
})

test.todo('is_dataframe is false for vector')

test.todo('is_dataframe is false for JSON list of records')

test.todo('rownames 1')

test.todo('rownames fails for non dataframe')

test.todo('rownames defaults to indices')

test.todo('colnames 1')

test.todo('colnames fails for non dataframe')

test.todo('colnames defaults to indices')

test.todo('nrow dataframe')

test.todo('nrow matrix')

test.todo('nrow fails for unsupported types')

test.todo('ncol dataframe')

test.todo('ncol matrix')

test.todo('ncol fails for unsupported types')



/**************************** DATA MANIPULATION *****************************/

test.todo('zip 2 vectors')

test.todo('zip 3 vectors')


test.todo('expand_grid same as cartesian product for 2 sets')
test.todo('expand_grid same as cartesian product for 2 sets with duplicates')
test.todo('expand_grid for 3 sets')

test.todo('paste single vector, collapsing to string')
test.todo('paste multiple vectors, using sep')


// ADD MORE TEST CASES
test('rbind dataframes no rownames/colnames', t => {
  var a = r.dataframe([1,2], [4,5])
  var b = r.dataframe([3], [6])
  var exp = r.dataframe([1,2,3], [4,5,6])
  var act = r.rbind(a,b)
  t.true(r.nrow(a) == 2) // Guarantee no side effects
  t.true(r.nrow(b) == 1) // Guarantee no side effects
  t.true(r.all(r.is_equal_cols(act,exp)))
})

// ADD MORE TEST CASES
test.todo('cbind 1')


/******************************* DATA AGGREGATION ***************************/

// ADD MORE TEST CASES
test.todo('table 1 vector')

test.todo('table 2 vectors')



// ADD MORE TEST CASES
test('by with identity returns panels', t => {
  var x = r.dataframe([1,2,3,4,5], [1,1,2,2,3])
  var exp = [
    r.dataframe([1,2], [1,1]),
    r.dataframe([3,4], [2,2]),
    r.dataframe([5], [3])
  ]
  var act = r.by(x, x[1], xi => xi)
  t.true(r.nrow(x) == 5) // Guarantee no side effects
  r.map(r.seq(r.length(exp)),
    i => t.true(r.all(r.is_equal_cols(act[i],exp[i]))) )
})

test('by using single index', t => {
  var x = r.dataframe([1,2,3,4,5], [1,1,2,2,3])
  var exp = [
    r.dataframe([2,3], [1,1]),
    r.dataframe([4,5], [2,2]),
    r.dataframe([6], [3])
  ]
  var act = r.by(x, x[1], function(xi) { 
    xi[0] = r.add(xi[0], 1)
    return xi
  })
  t.true(r.nrow(x) == 5) // Guarantee no side effects
  r.map(r.seq(r.length(exp)),
    i => t.true(r.all(r.is_equal_cols(act[i],exp[i]))) )
})



/*************************** UNARY MATH FUNCTIONS **************************/
// ADD TESTS


/************************** BINARY MATH FUNCTIONS **************************/
// ADD TESTS


/******************************** STATISTICS ********************************/
// ADD TESTS


/******************************* PROBABILITY ********************************/
// ADD TESTS

