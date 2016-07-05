/**
 * Created by LuJian on 2016/7/5.
 */


var dirTree = require('./../lib/dir-tree');
dirTree.find('e://').then(function(data){
    dirTree.display(data.data);
}).fail(function(data){
    console.log(data);
}).progress(function(data){
    console.log(data);
})