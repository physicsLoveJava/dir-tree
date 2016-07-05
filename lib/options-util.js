/**
 * Created by LuJian on 2016/7/4.
 */

var ScanObj = require('./scanObj');
var opDefault = require('./options');

module.exports = {
    filterFileType : function(file, options){
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
    },
    isOptionsFileEmpty : function(fileOption){
        if(!fileOption){
            return true;
        }
        if(fileOption instanceof Array){
            return fileOption.length === 0;
        }
        return false;
    },
    getDefaultScanObj: function(options){
        return ScanObj(options);
    },
    getDefaultOption: function(options){
        return opDefault.defaultOptions(options);
    }
}