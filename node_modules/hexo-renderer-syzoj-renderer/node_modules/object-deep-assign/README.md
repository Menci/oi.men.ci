# object-deep-assign


## Install
To install from npm:
```
npm install --save object-deep-assign
```

## Usage
For Node.js:
```javascript
var deepAssign = require('object-deep-assign');

var obj1 = {
  a: 1,
  b: {
    c: 3,
    d: [
      {id: 1, name: 'apple'},
      {id: 2, name: 'orange'}
    ]
  },
  e: ['hello', 100, null, undefined]
}

var obj2 = {
  a:{
    f:4
  }
}

deepAssign({},obj1,obj2)
// {
//   a: {
//     f:4
//   },
//   b: {
//     c: 3,
//     d: [
//       {id: 1, name: 'apple'},
//       {id: 2, name: 'orange'}
//     ]
//   },
//   e: ['hello', 100, null, undefined]
// }

```


## ChangeLog
### 0.1.0
- 第一版本。
