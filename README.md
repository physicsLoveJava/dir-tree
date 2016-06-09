# dir-tree 
![Build status] (https://travis-ci.org/physicsLoveJava/dir-tree.svg?branch=master)

**dir-tree** is a simple directory tree scanner for node, which supports directory level update, filters, display tree structure and so on.

# Install

Assumed you have the node env.
```javascript
  npm i dir-tree
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
