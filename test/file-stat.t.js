/**
 * Created by LuJian on 2016/6/28.
 */
var chai  = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var path = require('path');
chai.use(chaiAsPromised);
chai.should();

var fileStat = require('./../lib/file-stat');

describe('file-stat', function(){

    describe('#fileInfo', function(){

        it('should throw an error when input is empty', function(){
            var fPath = path.join(__dirname, './for-test-1');
            return fileStat.fileInfo(fPath).should.eventually.have
                .then(function(data){
                    expect(data).to.be.null;
                }, function(err){
                    expect(err).to.be.have.deep.property('code', 'ENOENT');
                });
        });

        it('should act as expect show the file info when input is exist and input is directory', function(){
            var fPath = path.join(__dirname, './for-test');
            return fileStat.fileInfo(fPath).should.eventually.have
                .then(function(data){
                    expect(data).to.be.not.null;
                    expect(data).to.have.deep.property('filePath', fPath);
                    expect(data).to.have.deep.property('isDirectory', true);
                }, function(err){
                    expect(err).to.be.null;
                });
        });

        it('should act as expect show the file info when input is exist and input is file', function(){
            var fPath = path.join(__dirname, './for-test', './c.txt');
            return fileStat.fileInfo(fPath).should.eventually.have
                .then(function(data){
                    expect(data).to.be.not.null;
                    expect(data).to.have.deep.property('filePath', fPath);
                    expect(data).to.have.deep.property('isDirectory', false);
                }, function(err){
                    expect(err).to.be.null;
                });
        });

        /**
         * this test case contains permission problem
         * test pass
         */
        // it('should throw an error when input has no permission', function(){
        //     var fPath = path.join(__dirname, './for-test-no-permission');
        //     return fileStat.fileInfo(fPath).should.eventually.have
        //         .then(function(data){
        //             expect(data).to.be.null;
        //         }, function(err){
        //             expect(err).to.have.deep.property('code', 'EPERM');
        //         });
        // });

        it('should return is directory', function(){
            var fPath = path.join(__dirname, './for-test');
            return fileStat.isDirectory(fPath).should.eventually.have
                .then(function(data){
                    expect(data).to.be.true;
                }, function(err){
                    expect(err).to.be.null;
                });
        });

    });

});