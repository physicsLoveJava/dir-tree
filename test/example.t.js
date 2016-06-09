/**
 * Created by LUJIAN on 2016/6/9.
 */

var chai  = require('chai');
var expect = chai.expect;
chai.should();


describe('#example', function(){

  it('should pass', function(){
      expect('hello').to.be.equal('hello');
  });

});