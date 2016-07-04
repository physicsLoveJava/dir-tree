/**
 * Created by LUJIAN on 2016/6/5.
 */

var path = require('path');
var fs = require('fs');
var Q = require('q');
var fileStat = require('./file-stat');

function scan(dirPath, options){

  var scanObj = {};
  scanObj.dirs_queue = [];
  scanObj.msg_queue = [];
  scanObj.msg_timer = void 0;
  options === undefined ? (options = defaultOptions()) : void 0;
  scanObj.options = options;

  var deferred = Q.defer();

  fileStat.isDirectory(dirPath)
      .then(function(data) {
      if (!data) {
        deferred.reject({message: 'path is not a directory'});
        return;
      }
      return dirPath;
    }).then(function(dirPath){
        return findDirectSubDirectories(scanObj, dirPath);
    }).then(function(){
      checkAndTravel(scanObj, deferred);
    }).then(function(){
      notifyTask(scanObj, 10, function(){
          deferred.notify(scanObj.msg_queue.shift());
       }).done(function(){
          deferred.resolve({message: 'success'});
       });
    });
  return deferred.promise;
}

function find(dirPath, options){
  options === undefined ? (options = defaultOptions()) : void 0;
  return Q.Promise(function(resolve, reject, progress){
    var jqTree = {};
    scan(dirPath, options).progress(function(data){
      progress(data);
      updateTree(jqTree, data);
    }).done(function(){
      removeEmptyDirs(jqTree, options);
      resolve(jqTree);
    });
  });
}

function removeEmptyDirs(tree, options){
  if(isOptionsFileEmpty(options.file)){
    return;
  }
  var root = tree.data[0];
  var stack = [];
  //visit , 0 , 1  (unvisited, visited)
  root.visit = 0;
  root.cvisit = 0;
  stack.push(root);
  while(stack.length > 0){
    var current = stack[stack.length - 1];
    if(current.children.length === 0){
      current.cvisit = 1;
    }else{
      var hasUnVisited = false;
      for(var i = 0; i < current.children.length; i ++){
        if(current.children[i].isDirectory){
          if(!current.children[i].visit){
            hasUnVisited = true;
          }else if(current.children[i].visit === 0){
            hasUnVisited = true;
          }
        }
      }
      if(!hasUnVisited){
        current.cvisit = 1;
      }
    }
    if(current.cvisit === 0){
      for(var j = 0; j < current.children.length; j ++){
        if(current.children[j].isDirectory){
          current.children[j].visit = 0;
          current.children[j].cvisit = 0;
          stack.push(current.children[j]);
        }
      }
    }else{
      if(current.children.length === 0){
        //visit current node
        removeTreeNode(tree, current.name);
      }
      current.visit = 1;
      stack.pop();
    }
  }
}

function removeTreeNode(tree, name){
  var root = tree.data[0];
  var queue = [];
  queue.push({parent: {children: [root]}, real: root, index: 0});
  while(queue.length > 0){
      var current = queue.pop();
      if(current.real.name === name){
        current.parent.children.splice(current.index, 1);
      }else{
         for(var i = 0; i < current.real.children.length; i++){
           if(current.real.children[i].isDirectory){
             queue.push({parent: current.real, real: current.real.children[i], index: i});
           }
         }
      }
  }
}

function isOptionsFileEmpty(fileOption){
  if(fileOption === undefined){
    return true;
  }
  if(fileOption instanceof Array){
    return fileOption.length === 0;
  }
  return false;
}

function updateTree(tree, data) {
  if (tree.data === undefined) {
    if(data === undefined){
      throw new Error('data is undefined');
    }
    tree.data = [];
    tree.data.push(getFormatNode(data));
    tree.toUpdate = data.toUpdate;
    tree.current = data.parent;
  } else {
    if (tree.toUpdate.length === 0) {
      throw new Error('should not notify data when there is no sub node to update.');
    }

    for (var i = 0; i < tree.toUpdate; i++) {
      if (tree.toUpdate[i] === data.parent) {
        tree.toUpdate.splice(i, 1);
      }
    }
    data.toUpdate.forEach(function (info) {
      tree.toUpdate.push(info);
    });
    updateSubNode(tree, data);
  }

  function getFormatNode(data){
    return {name: data.parent, children: data.children.map(function(child){
      return  {name: child.filePath, isDirectory: child.isDirectory};
    })};
  }

  function updateSubNode(tree, data) {
    var queue = [];
    queue.push(tree.data[0]);
    while(queue.length > 0){
      var current = queue.shift();
      if(current.name === data.parent){
        current.children = getFormatNode(data).children;
        return;
      }else{
        if(current.children){
          current.children.map(function(child){
            queue.push(child);
          });
        }
      }
    }
  }
}

function checkAndTravel(scanObj, deferred){
  if(scanObj.dirs_queue.length > 0){
    var first = scanObj.dirs_queue.shift();
    findDirectSubDirectories(scanObj, first).then(function(){
        checkAndTravel(scanObj, deferred);
    });
  }
}

function findDirectSubDirectories(scanObj, dirPath){
  var subPm = findDirectSubFiles(dirPath, scanObj.options)
    .then(function(infoList){
      infoList.children.forEach(function(info){
        if(info.isDirectory){
          scanObj.dirs_queue.push(info.filePath);
        }
      });
      scanObj.msg_queue.push(infoList);
      return infoList;
    });
  return Q.all([subPm]);
}

 function findDirectSubFiles(dirPath, options){

  return Q.Promise(function(resolve, reject){
        fs.readdir(dirPath, function(err, fileList){
            if(err){
              reject(err);return;
            }

          var promises = [];
          fileList.forEach(function(file){
            if(filterFileType(file, options)){
              promises.push(fileStat.fileInfo(path.join(dirPath, file)));
            }
          });
          return Q.all(promises).then(function(infoList){
            var result = {};
            result.parent = dirPath;
            result.children = infoList;
            result.toUpdate = (function(){
              var result = [];
              infoList.forEach(function(info){
                if(info.isDirectory){
                  result.push(info);
                }
              });
              return result;
            }());
            resolve(result);
          });
        });
  });

}

function filterFileType(file, options){
    var suffix = options.file;
    if(suffix === undefined){
      throw new Error('file option is not set.');
    }
    var extIndex = file.lastIndexOf('.');
    if(extIndex === -1){
      return true;
    }
    var ext = file.substr(extIndex);
    if(suffix instanceof Array){
      if(suffix.length === 0){
        return true;
      }
      return suffix.filter(function(x){
        return x.toUpperCase() === ext.toUpperCase();
      }).length > 0;
    }
    if(suffix instanceof RegExp){
      return suffix.test(file);
    }
    return false;
}

function notifyTask(scanObj, latency, cb){
  return Q.Promise(function(resolve, reject){

    if(scanObj.msg_queue.length <= 0){
      if(scanObj.dirs_queue.length > 0){
        setTimeout(function(){
          notifyTask(scanObj, latency, cb);
        }, 10);
      }else{
        reject(new Error('msg_queue is wrong.'));
      }
      return;
    }

    var timer = setInterval(function(){
      if(scanObj.msg_queue.length > 0){
        cb();
      }else{
        clearInterval(timer);
        resolve();
      }
    }, latency);
  });
}

function defaultOptions(){
  return {
      file: [],
      directory: [],
      layout: 'flat' // flat hierarchy

  };
}

function display(data){
  if(! data instanceof Array){
    throw new Error('input data format is illegal.');
  }
  var banner = '------------------------';
  console.log(banner + 'start' + banner);
  displayRoot(data, 0);
  console.log(banner + 'end' + banner);
}

function displayRoot(data, level){
  var xLevel = level;
  if(!data){
    return;
  }
  for(var i = 0; i < data.length; i++){
    console.log(displayLevel(xLevel ++) + data[i].name);
    displayRoot(data[i].children, xLevel);
    xLevel --;
  }
}

function displayLevel(level){
  if(level <= 0){
    return '';
  }
  var result = '';
  for(var i = 0; i < level; i++){
    result += '    ';
  }
  result += '└─';
  return result;
}


module.exports.subDirectory = findDirectSubFiles;
module.exports.scan = scan;
module.exports.find = find;
module.exports.display = display;
module.exports.removeTreeNode = removeTreeNode;
