var jsonrpc = require('../lib/index');
var ChildProcessTransport = jsonrpc.transports.client.childProcess;
var JsonRpcClient = jsonrpc.client;
var ErrorObject = jsonrpc.errorobject;
var childProcess = require('child_process');

var child = childProcess.fork(__dirname + '/child/child.js');
var jsonRpcClient = new JsonRpcClient(new ChildProcessTransport(child));
jsonRpcClient.register(['loopback', 'failure']);

exports.loopback = function(test) {
    test.expect(2);
    jsonRpcClient.loopback({foo: 'bar'}, function(err, result) {
        test.ok(!!result, 'result exists');
        test.equal(result.foo, 'bar', 'Looped back correctly');
        test.done();
    });
};

exports.failureTcp = function(test) {
    test.expect(4);
    jsonRpcClient.failure({foo: 'bar'}, function(err) {
        test.ok(!!err, 'error exists');
        test.equal(ErrorObject.internalError.code, err.code);
        test.equal("Whatchoo talkin' 'bout, Willis?", err.data.message, 'The error message was received correctly');
        test.equal(1, err.data.prop, 'The error message was received correctly');
        child.kill();
        test.done();
    });
};
