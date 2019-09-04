'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = require('express')();
var server = require('http').createServer(app);

var credentials = {
    key: _fs2.default.readFileSync(__dirname + '/privkey.pem'),
    cert: _fs2.default.readFileSync(__dirname + '/fullchain.pem')
};
var httpsServer = require('https').createServer(credentials, app);
var io = require('socket.io')(httpsServer);

var PORT = 8080;

var clients = [];

// connection event handler
// connection이 수립되면 event handler function의 인자로 socket이 들어온다

io.on('connection', function (socket) {

    // 유저가 커넥션을 유지할때
    socket.on('login', function (data) {
        // data will be a object of a user.
        console.log('user login:', data.email);
        socket.email = data.email;
        clients.push(socket);
    });

    // 다른 유저에게 초대장을 보낼때
    socket.on('send-invitation', function (data) {
        // data 는 초대장을 받을 user 객체
        // 초대장을 받을 유저의 email
        var email = data.email;
        // 해당 email로 userObject 를 찾는다. 

        var userSocket = clients.filter(function (client) {
            return client.email === email;
        })[0];
        // 해당 user 에게 unreadEmailNumbers request 를 요청하도록 메시지를 보낸다. 
        if (userSocket === null || userSocket === undefined) {
            return;
        }
        console.log('usersocket:', userSocket.id);
        userSocket.emit('unreadEmailNumbers');
        // io.to(userSocket.id).emit('unreadEmailNumbers')
    });

    // 커넥션이 끊켰을때
    socket.on('forceDisconnect', function () {
        var newClients = clients.filter(function (client) {
            return client !== socket;
        });
        clients = newClients;
        console.log('user force disconnected: ', socket.email);
        socket.disconnect();
    });
    socket.on('disconnect', function () {
        var newClients = clients.filter(function (client) {
            return client !== socket;
        });
        clients = newClients;
        console.log('user disconnected: ', socket.email);
    });
});

httpsServer.listen(PORT, function () {
    console.log('Socket IO Server listening on port ' + PORT);
});