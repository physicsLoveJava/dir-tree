
var chai  = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var path = require('path');
chai.use(chaiAsPromised);
chai.should();

var dir_tree = require('./../lib/dir-tree.js');

describe('dir-tree', function(){
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

});

