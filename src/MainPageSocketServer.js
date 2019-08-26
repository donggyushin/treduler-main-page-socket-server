var app = require('express')();
var server = require('http').createServer(app)
var io = require('socket.io')(server)

var PORT = 8080;

var clients = [];

// connection event handler
// connection이 수립되면 event handler function의 인자로 socket이 들어온다

io.on('connection', function (socket) {

    socket.on('login', function (data) {
        // data will be a object of a user.
        const userObject = {
            email: data.email,
            socket
        }
        clients.push(userObject)
    })
})

server.listen(PORT, function () {
    console.log(`Socket IO Server listening on port ${PORT}`)
})