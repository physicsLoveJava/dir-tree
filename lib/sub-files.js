/**
 * Created by LuJian on 2016/7/4.
 */

var Q = require('q');
var fs = require('fs');
var path = require('path');
var fileStat = require('./file-stat');
var util = require('./options-util');

module.exports = {
    findDirectSubFiles : function(dirPath, options){
        return Q.Promise(function(resolve, reject){
            fs.readdir(dirPath, function(err, fileList){
                if(err){
                    reject(err);return;
                }

                var promises = [];
                if(!fileList){
                    throw new Error('file list is undefined');
                }
                fileList.forEach(function(file){
                    if(util.filterFileType(file, options)){
                        promises.push(fileStat.fileInfo(path.join(dirPath, file)));
                    }
                });
                return Q.allSettled(promises).then(function(infoList){
                    var result = {};
                    result.parent = dirPath;
                    result.children = (function(){
                        var result = [];
                        infoList.forEach(function(single){
                            if(single.state === 'fulfilled'){
                                result.push(single.value);
                            }
                        });
                        return result;
                    }());
                    result.error = (function(){
                        var result = [];
                        infoList.forEach(function(single){
                            if(single.state === 'rejected'){
                                result.push(single.reason);
                            }
                        });
                        return result;
                    }());
                    result.toUpdate = (function(){
                        var result = [];
                        infoList.forEach(function(single){
                            if(single.state === 'fulfilled'){
                                if(single.value.isDirectory){
                                    result.push(single.value);
                                }
                            }
                        });
                        return result;
                    }());
                    resolve(result);
                }, function(err){
                    reject(err);
                });
            });
        });

    }
};