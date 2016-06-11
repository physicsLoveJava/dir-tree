# dir-tree 
<a href="https://travis-ci.org/physicsLoveJava/dir-tree" >
 <img src='https://travis-ci.org/physicsLoveJava/dir-tree.svg?branch=master' alt='Build status'/>
</a>
<a href="https://codeclimate.com/github/physicsLoveJava/dir-tree">
  <img src='https://codeclimate.com/github/physicsLoveJava/dir-tree/badges/gpa.svg' alt='Code Climate'>
</a>

**dir-tree** is a simple directory tree scanner for node, which supports directory level update, filters, display tree structure and so on.

# Install

Assumed you have the node env.
```javascript
  npm i dir-tree-scanner
```

# Usage

## Find
You can use **find** function as a try.
```javascript
var dirTree = require('dir-tree-scanner');
var path = './test';
dirTree.find(path)
    .then(function(result){
        console.log(result);
    }, function(err){
        console.log('err:', err);
    }, function(data){
        console.log('progress: ', data);
    });
```
To make result more intuitive, you can use the **display** function.
```javascript
var dirTree = require('dir-tree-scanner');
var path = './test';
dirTree.find(path)
    .then(function(result){
        dirTree.display(result.data);
    }, function(err){
        console.log('err:', err);
    }, function(data){
        console.log('progress: ', data);
    });
```
You can use filters as well.
```javascript
var dirTree = require('dir-tree-scanner');
var path = './test';
dirTree.find(path, {
      file: ['.js', '.md'] 
      // the same as regular expression
      // file: /(\.js|\.md)$/
    })
    .then(function(result){
        dirTree.display(result.data);
    }, function(err){
        console.log('err:', err);
    }, function(data){
        console.log('progress: ', data);
    });
```

#Example

## Use It For Mocha Test
Below is an example using dir-tree-scanner to do mocha test. The functionality of the code is the same as mocha cli to some extent. Remember to install all the dependencies to run the example.
```javascript
var dirTree = require('dir-tree-scanner');
var path = require('path');
var Q = require('q');
var exec = require('child_process').exec;
require('colors');

dir_tree.find('./test', {
  file: /(\.t\.js)$/
}).then(function(srcTree){
  var testSrc = srcTree.data[0].children;
  loopTest(testSrc);
});

function loopTest(testSrc){
  if(testSrc.length > 0){
    doTest(testSrc.shift().name)
      .then(function(){
        loopTest(testSrc);
      }, function(err){
        console.log(err.red);
      })
  }
}

function doTest(testFile) {
  return Q.Promise(function (resolve, reject) {
    var mochaTest = exec('mocha ' + testFile);

    var banner = '----------------------';
    console.log((banner + path.basename(testFile) + ' start ' + banner).green);

    mochaTest.stdout.on('data', function (data) {
      console.log(data);
    });

    mochaTest.stderr.on('data', function (err) {
      console.log(err.red);
    });

    mochaTest.on('close', function (code) {
      console.log((banner + path.basename(testFile) + ' end ' + banner).green);
      console.log('child process exited with code ' + code);
      resolve();
    });

    mochaTest.on('error', function (err) {
      console.log(err);
      reject();
    });
  });
}
```