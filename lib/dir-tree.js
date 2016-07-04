/**
 * Created by LUJIAN on 2016/6/5.
 */

var path = require('path');
var fs = require('fs');
var Q = require('q');
var fileStat = require('./file-stat');
var subFiles = require('./sub-files');
var util = require('./options-util');
var treeUtil = require('./treenode-util');

function scan(dirPath, scanObj){

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
  return Q.Promise(function(resolve, reject, progress){
    var jqTree = {};
    scan(dirPath, util.getDefaultScanObj(options))
      .progress(function(data){
      progress(data);
      treeUtil.updateTree(jqTree, data);
    }).done(function(){
      treeUtil.removeEmptyDirs(jqTree, options);
      resolve(jqTree);
    });
  });
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
  return subFiles.findDirectSubFiles(dirPath, scanObj.options)
    .then(function(infoList){
      infoList.children.forEach(function(info){
        if(info.isDirectory){
          scanObj.dirs_queue.push(info.filePath);
        }
      });
      scanObj.msg_queue.push(infoList);
      return infoList;
    });
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


module.exports.scan = scan;
module.exports.find = find;
module.exports.display = display;
