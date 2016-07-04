/**
 * Created by LuJian on 2016/7/4.
 */

var util = require('./options-util');
module.exports = {
    updateTree : function(tree, data) {
        var self = this;
        if (tree.data === undefined) {
            if(data === undefined){
                throw new Error('data is undefined');
            }
            tree.data = [];
            tree.data.push(self.getFormatNode(data));
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
            self.updateSubNode(tree, data);
        }
    },
    getFormatNode : function(data){
        return {name: data.parent, children: data.children.map(function(child){
            return  {name: child.filePath, isDirectory: child.isDirectory};
        })};
    },
    updateSubNode : function(tree, data) {
        var queue = [];
        var self = this;
        queue.push(tree.data[0]);
        while(queue.length > 0){
            var current = queue.shift();
            if(current.name === data.parent){
                current.children = self.getFormatNode(data).children;
                return;
            }else{
                if(current.children){
                    current.children.map(function(child){
                        queue.push(child);
                    });
                }
            }
        }
    },
    removeEmptyDirs : function(tree, options){
        var self = this;
        if(util.isOptionsFileEmpty(options.file)){
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
                    self.removeTreeNode(tree, current.name);
                }
                current.visit = 1;
                stack.pop();
            }
        }
    },
    removeTreeNode : function(tree, name){
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
}