/**
 * Created by LuJian on 2016/7/4.
 */


function ScanObj(options){
    var scanObj = {};
    scanObj.dirs_queue = [];
    scanObj.msg_queue = [];
    scanObj.msg_timer = undefined;
    scanObj.options = !options ? options : defaultOptions();
    return scanObj;
}

function defaultOptions(){
    return {
        file: [],
        directory: [],
        layout: 'flat' // flat hierarchy

    };
}


module.exports = ScanObj;