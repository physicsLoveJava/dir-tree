/**
 * Created by LuJian on 2016/6/28.
 */
var chai  = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var path = require('path');
chai.use(chaiAsPromised);
chai.should();

var subFiles = require('./../lib/sub-files');

describe('sub-files', function(){

    describe('#fileDirectSubFiles', function(){

        it('should list all sub file when input is directory', function(){
            var fPath = path.join(__dirname, './for-test');
            return subFiles.findDirectSubFiles(fPath, { file : []}).should.eventually.have
                .then(function(data){
                    expect(data).to.have.deep.property('children').length(6);
                }, function(err){
                    expect(err).to.be.null;
                });
        })

        it('should throw an error when input is file', function(){
            var fPath = path.join(__dirname, './for-test', './c.txt');
            return subFiles.findDirectSubFiles(fPath, { file : []}).should.eventually.have
                .then(function(data){
                    expect(data).to.be.null;
                }, function(err){
                   expect(err).to.have.deep.property('code', 'ENOTDIR');
                });
        })

        it('should list sub files when input contains no access right file', function(){
            var fPath = path.join(__dirname, './');
            return subFiles.findDirectSubFiles(fPath, { file : []}).should.eventually.have
                .then(function(data){
                    expect(data).to.be.not.null;
                }, function(err){
                   expect(err).to.be.null;
                });
        })

        /**
         * this test case involves permission problem
         */
        // it('should throw an error when input is no access right file', function(){
        //    var fPath = path.join(__dirname, './for-test-no-permission');
        //     return subFiles.findDirectSubFiles(fPath, { file : []}).should.eventually.have
        //         .then(function(data){
        //             expect(data).to.be.null;
        //         }, function(err){
        //             expect(err).to.be.not.null;
        //         });
        // })

        /**
         * this error is due to the window's system volume information
         * has no enough access right problem
         */
        // it('should with no problem', function(){
        //     var fPath = 'e:\\';
        //     return subFiles.findDirectSubFiles(fPath, { file : []}).should.eventually.have
        //         .then(function(data){
        //             expect(data).to.be.not.null;
        //         }, function(err){
        //             console.log(err)
        //            expect(err).to.be.null;
        //         });
        // })

    });

});