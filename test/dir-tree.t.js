
var chai  = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var path = require('path');
chai.use(chaiAsPromised);
chai.should();

var dir_tree = require('./../lib/dir-tree.js');

describe('dir-tree', function(){
  describe('#subDirectory()', function(){

    var options = {
      file: []
    };

    it('should return empty array', function(){
      var result = [].map(function(item){return item});
      expect(result).deep.equal([]);
    });


    it('should find all the sub directories', function(){
      var fPath = path.join(__dirname, './for-test');
      return dir_tree.subDirectory(fPath, options).should.eventually.have.then(function(subDirs){
          expect(subDirs).have.deep.property('parent', fPath);
          expect(subDirs).have.deep.property('children').have.length(6);
        }, function(err){
          expect(err).to.be.null;
        });
    });

    it('should filter by options suffix array', function(){
      var fPath = path.join(__dirname, './for-test');
      var forOptions = {
        file: ['.txt', '.js', '.md']
      };
      return dir_tree.subDirectory(fPath, forOptions).should.eventually.have.then(function(subDirs){
        expect(subDirs).have.deep.property('parent', fPath);
        expect(subDirs).have.deep.property('children').have.length(5);
      }, function(err){
        expect(err).to.be.null;
      });
    });

    it('should filter by options suffix regexp', function(){
      var fPath =path.join(__dirname, './for-test');
      var forOptions = {
        file: /(\.txt|\.js|\.md)$/
      };
      return dir_tree.subDirectory(fPath, forOptions).should.eventually.have.then(function(subDirs){
        expect(subDirs).have.deep.property('parent', fPath);
        expect(subDirs).have.deep.property('children').have.length(5);
      }, function(err){
        expect(err).to.be.null;
      });
    });

    it('should return an empty array where input directory is empty', function(){
      var fPath = path.join(__dirname, './for-test/b');
      return dir_tree.subDirectory(fPath, options).should.eventually.have.then(function(subDirs){
        expect(subDirs).have.deep.property('parent', fPath);
        expect(subDirs).have.deep.property('children').have.length(1);
      }, function(err){
        expect(err).to.be.null;
      })
    });

    it('should throw an error when input is file', function(){
      var fPath = path.join(__dirname, './for-test/c.txt');
      return dir_tree.subDirectory(fPath, options).should.eventually.have.then(function(subDirs){
        expect(subDirs).to.be.null;
      }, function(err){
        expect(err).to.be.not.null;
      });
    });

  });

  describe('for queue operations', function(){

  it('should act like queue', function(){
    var queue = [1, 2, 3];
    var first = queue.shift();
    expect(first).equal(1);
    queue.push(4);
    expect(queue).deep.equal([2, 3, 4]);
  });

    it('should update queue', function(){
      this.timeout(4000);
      var obj = {
        arr: [1,2,3]
      }
      processQueue(obj);
      function processQueue(o){
        o.arr = [2, 3, 4];
        o.arr.shift();
      }
      expect(obj).to.have.property('arr').deep.equal([3, 4]);
    })

});

  describe('#_checkIfDirectory', function(){
    it('should false when input is not a directory', function(){
      var fPath =path.join(__dirname, './for-test/c.txt');
      return dir_tree._checkIfDirectory(fPath).should.eventually.have.then(function(data){
        expect(data).to.be.false;
      }, function(err){
        expect(err).to.be.null;
      });
    });

    it('should true when input is a directory', function(){
      var fPath = path.join(__dirname, './for-test/a');
      return dir_tree._checkIfDirectory(fPath).should.eventually.have.then(function(data){
        expect(data).to.be.true;
      }, function(err){
        expect(err).to.be.null;
      });
    });
  });

  describe('#scan', function(){
    it('should scan directory', function(){
      var dest = path.join(__dirname, './for-test');
      var jqTree = {};
      return dir_tree.scan(dest).should.eventually.have.then(function(data){
        //console.log('success----data ', jqTree);
        expect(data).to.deep.property('message', 'success');
      }, function(err){
        expect(err).to.be.null;
      }, function(data){
        //console.log('--------------notify start --------------');
        //console.log('parent %s, children ', data.parent, data.children, ' toUpdate: ', data.toUpdate);
        //console.log('--------------notify end --------------');
        updateTree(jqTree, data);
      });

      function updateTree(tree, data) {
        if (tree.data === undefined) {
          if(data === undefined){
            throw new Error('data is undefined');
            return;
          }
          tree.data = [];
          tree.data.push({name: data.parent, children: data.children.map(function(child){
            return  {name: child.filePath, isDirectory: child.isDirectory};
          })});
          tree.toUpdate = data.toUpdate;
          tree.current = data.parent;
        } else {
          if (tree.toUpdate.length === 0) {
            throw new Error('should not notify data when there is no sub node to update.');
            return;
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

        function updateSubNode(tree, data) {
          var queue = [];
          queue.push(tree.data[0]);
          while(queue.length > 0){
            var current = queue.shift();
            if(current.name === data.parent){
              current.children = data.children.map(function (child) {
                return {name: child.filePath, isDirectory: child.isDirectory};
              });
              return;
            }else{
              if(current.children){
                current.children.forEach(function(child){
                  queue.push(child);
                });
              }
            }
          }
        }
      }
    });
  });

  describe('#find()', function(){

    it('should find recursively', function(){
      var fPath = path.join(__dirname, './for-test');
      return dir_tree.find(fPath, {
        file: ['.js']
      }).should.eventually.have.then(function(data){
          //dir_tree.display(data.data);
        }, function(err){
          expect(err).to.be.null;
        }, function(data){
          //console.log('progress ', data);
        });
    });

  });

  describe('#display()', function(){

    it('should display the directory tree', function(){
      var fPath = path.join(__dirname, './for-test');
      return dir_tree.find(fPath, {
        file: ['.js', '.md']
      }).should.eventually.have.then(function(data){
          //dir_tree.display(data.data);
        }, function(err){
        }, function(data){
        });
    });

  });

  describe('#chop tree', function(){

    it('should delete props', function(){
      var data = {
        abc: 'abc',
        children: [
          {abc: 'abc', bcd: 'bcd'},
          {abc: 'abc', bcd: 'bcd'}
        ]
      };
      delete data.children[0].bcd;
      expect(data).to.not.have.deep.property('children[0].bcd');
    });

  });

  describe('#remove tree node()', function(){

    it('should remove tree node when the value exists', function(){

      var tree = {data: [{
        name: 'a',
        children: [
          {name: 'b', isDirectory: true, children: [{name: 'b1', children: []}]},
          {name: 'c', isDirectory: true, children: [{name: 'c1', children: []}]},
          {name: 'd', isDirectory: true, children: [{name: 'd1', children: []}]}
        ]
      }]};

      dir_tree.removeTreeNode(tree, 'b');
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

      dir_tree.removeTreeNode(tree, 'e');
      expect(tree).to.have.deep.property('data[0].children').to.length(3);
    });

  });

});

