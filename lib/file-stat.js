/**
 * Created by LuJian on 2016/6/28.
 */

var Q = require('q');
var fs = require('fs');

module.exports = {
    fileInfo: function(filePath){
        return Q.Promise(function(resolve, reject){
            fs.stat(filePath, function(err, info){
                if(err) reject(err);
                else{
                    resolve({filePath: filePath, isDirectory: info.isDirectory()});
                }
            });
        });
    },
    isDirectory: function(filePath){
        var self = this;
        return Q.Promise(function(resolve, reject){
            self.fileInfo(filePath).then(function(data){
                resolve(data.isDirectory);
            }, function(err){
                reject(err);
            });
        });
    }
};


