/**
 * Created by LuJian on 2016/7/4.
 */
var chai  = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var path = require('path');
chai.use(chaiAsPromised);
chai.should();

var treeUtil = require('./../lib/treenode-util');

describe('tree-node-util', function(){


    describe('#updateTree', function(){

        it('should update tree and remove update list', function(){

            var tree = {data: [{
                name: 'a',
                children: [
                    {name: 'b', isDirectory: true, children: [{name: 'b1', isDirectory: true, children: []}]},
                    {name: 'c', isDirectory: true, children: [{name: 'c1', isDirectory: true, children: []}]},
                    {name: 'd', isDirectory: true, children: [{name: 'd1', isDirectory: true, children: []}]}
                ]
            }],
            toUpdate: [{name: 'b1'}]};

            var data = {
                parent : 'b1',
                children: [
                    {filePath: 'b11', isDirectory: true},
                    {filePath: 'b12', isDirectory: false},
                    {filePath: 'b13', isDirectory: false}
                ],
                toUpdate: []
            }

            treeUtil.updateTree(tree, data);
            expect(tree).to.have.deep.property('data[0].children[0].children[0].children').length(3);
        })

    })

    describe('#removeEmptyDirs', function(){

        it('should do nothing when options file is empty', function(){
            var tree = {data: [{
                name: 'a',
                children: [
                    {name: 'b', isDirectory: true, children: [{name: 'b1', isDirectory: true, children: []}]},
                    {name: 'c', isDirectory: true, children: [{name: 'c1', isDirectory: true, children: []}]},
                    {name: 'd', isDirectory: true, children: [{name: 'd1', isDirectory: true, children: []}]}
                ]
            }]};

            treeUtil.removeEmptyDirs(tree, { file: []});
            expect(tree).to.be.deep.property('data[0].children').length(3);
        })

        it('should remove empty dir', function(){

            var tree = {data: [{
                name: 'a',
                children: [
                    {name: 'b', isDirectory: true, children: [{name: 'b1', isDirectory: true, children: []}]},
                    {name: 'c', isDirectory: true, children: [{name: 'c1.js', isDirectory: false, children: []}]},
                    {name: 'd', isDirectory: true, children: [{name: 'd1.js', isDirectory: false, children: []}]}
                ]
            }]};

            treeUtil.removeEmptyDirs(tree, { file: ['.js']});
            expect(tree).to.be.deep.property('data[0].children').length(2);

        })

    })

    describe('#removeTreeNode', function(){
        it('should remove tree node when the value exists', function(){

            var tree = {data: [{
                name: 'a',
                children: [
                    {name: 'c', isDirectory: true, children: [{name: 'c1', children: []}]},
                    {name: 'b', isDirectory: true, children: [{name: 'b1', children: []}]},
                    {name: 'd', isDirectory: true, children: [{name: 'd1', children: []}]}
                ]
            }]};

            treeUtil.removeTreeNode(tree, 'b');
            expect(tree).to.have.deep.property('data[0].children').to.length(2);
        });

        it('should not remove any tree node when the value doesn\'t exist', function(){
            var tree = {data: [{
                name: 'a',
                children: [
                    {name: 'b', isDirectory: true, children: [{name: 'b1', children: []}]},
                    {name: 'c', isDirectory: true, children: [{name: 'c1', children: []}]},
                    {name: 'd', isDirectory: true, children: [{name: 'd1', children: []}]}
                ]
            }]};

            treeUtil.removeTreeNode(tree, 'e');
            expect(tree).to.have.deep.property('data[0].children').to.length(3);
        });
    })

})