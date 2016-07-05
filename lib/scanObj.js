/**
 * Created by LuJian on 2016/7/4.
 */

var opDefault = require('./options');

function ScanObj(options){
    var scanObj = {};
    scanObj.dirs_queue = [];
    scanObj.msg_queue = [];
    scanObj.msg_timer = undefined;
    scanObj.options = opDefault.defaultOptions(options);
    return scanObj;
}

module.exports = ScanObj;