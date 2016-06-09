/**
 * Created by LUJIAN on 2016/6/8.
 */

var dir_tree = require('./index.js');
var path = require('path');
var Q = require('q');
var exec = require('child_process').exec;
var colors = require('colors');

dir_tree.find('./test', {
  file: /\.t\.js/
}).then(function(srcTree){
  var testSrc = srcTree.data[0].children;
  loopTest(testSrc);
}).progress(function(data){
  //console.log(data);
});

//doTest('./test/dir-tree.t.js').done(function(){
//  console.log('success');
//});


function loopTest(testSrc){
  if(testSrc.length > 0){
    doTest(testSrc.shift().name)
      .then(function(){
        loopTest(testSrc);
      }, function(err){
        console.log(err.red);
      })
  }
}

function doTest(testFile) {
  return Q.Promise(function (resolve, reject) {
    var testDir = path.join('./', testFile, '../');
    var mochaTest = exec('mocha ' + path.basename(testFile), {
      cwd: testDir
    });

    var banner = '----------------------';
    console.log((banner + path.basename(testFile) + ' start ' + banner).green);

    mochaTest.stdout.on('data', function (data) {
      console.log(data);
    });

    mochaTest.stderr.on('data', function (err) {
      console.log(err.red);
    });

    mochaTest.on('close', function (code) {
      console.log((banner + path.basename(testFile) + ' end ' + banner).green);
      console.log('child process exited with code ' + code);
      resolve();
    });

    mochaTest.on('error', function (err) {
      console.log(err);
      reject();
    });
  });
}