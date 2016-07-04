/**
 * Created by LuJian on 2016/7/4.
 */
var chai  = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var path = require('path');
chai.use(chaiAsPromised);
chai.should();

var util = require('./../lib/options-util');

describe('options-util', function(){

    describe('#filterFileType', function(){

        it('should throw an error when option has not file', function(){
            try{
                util.filterFileType(null, null);
            }catch(err){
                expect(err).to.be.not.null;
            }
        });

        it('should do nothing when file is not regular format', function(){
           util.filterFileType('xx/abx', { file : ['.js']}).should.to.be.true;
        });

        it('should do nothing when file option is empty array', function(){
           util.filterFileType('xx/abx.js', { file : []}).should.to.be.true;
        });

        it('should do filtering with true when file option contains filter content', function(){
           util.filterFileType('xx/abx.js', { file : ['.js']}).should.to.be.true;
        });

        it('should do filtering with false when file option contains filter content', function(){
           util.filterFileType('xx/abx.md', { file : ['.js']}).should.to.be.false;
        });

        it('should do filtering with true when file option contains multiple filtering content', function(){
            util.filterFileType('xx/abx.js', { file : ['.md', '.css', '.js']}).should.to.be.true;
        });

        it('should do filtering with true when file reg exp', function(){
           util.filterFileType('xx/abx.js', { file : /\.js$/}).should.to.be.true;
        });

        it('should do filtering with true when file reg exp contains multiple filtering content', function(){
           util.filterFileType('xx/abx.js', { file : /\.md|css|mst|js$/}).should.to.be.true;
        });

        it('should do filtering with false when file reg exp', function(){
           util.filterFileType('xx/abx.js', { file : /\.md$/}).should.to.be.false;
        });

    });

});