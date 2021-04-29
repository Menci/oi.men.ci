module.exports = function () {
  var len = arguments.length
  if (len < 1) { return false }
  if (len === 1) { return arguments[0] }

  function cloneObj (obj) {
    return JSON.parse(JSON.stringify(obj))
  }
  function isObj (val) {
    return val && val.constructor === Object
  }
  var queues = []
  for (var i = 0; i < arguments.length; i++) {
    if (isObj(arguments[i])) {
      queues.push(arguments[i])
    }
  }
  var dest = queues[0]

  function _as (dd, sd) {
    for (var key in sd) {
      // console.log(key,sd[key])
      var val
      if (isObj(sd[key])) {
        if (dd.hasOwnProperty(key)) {
          if (isObj(dd[key])) {
            val = _as(dd[key], sd[key])
          } else {
            // 拷贝对象
            val = cloneObj(sd[key])
          }
        } else {
          val = cloneObj(sd[key])
        }
      } else {
        val = sd[key]
      }
      // console.log(key,val)
      dd[key] = val
    }
    // console.log(dd)
    return dd
  }

  // 从第二个开始
  for (var j = 1; j < len; j++) {
    var sd = queues[j]
    _as(dest, sd)
  }
  return dest
}
