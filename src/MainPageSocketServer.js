var app = require('express')();
import fs from 'fs'
const credentials = {
    key: fs.readFileSync(__dirname + '/privkey.pem'),
    cert: fs.readFileSync(__dirname + '/cert.pem'),
    ca: fs.readFileSync(__dirname + '/chain.pem')
}

const env = process.env.NODE_ENV || 'dev';



let server = require('http').createServer(app)
if (env === 'production') {
    server = require('https').createServer(credentials, app)
}

var io = require('socket.io')(server)

var PORT = 8080;

var clients = [];

// connection event handler
// connection이 수립되면 event handler function의 인자로 socket이 들어온다

io.on('connection', function (socket) {

    // 유저가 커넥션을 유지할때
    socket.on('login', function (data) {
        // data will be a object of a user.
        console.log('user login:', data.email)
        socket.email = data.email
        clients.push(socket)
    })

    // 다른 유저에게 초대장을 보낼때
    socket.on('send-invitation', function (data) {
        // data 는 초대장을 받을 user 객체
        // 초대장을 받을 유저의 email
        const { email } = data;
        // 해당 email로 userObject 를 찾는다. 
        const userSocket = clients.filter(client => client.email === email)[0];
        // 해당 user 에게 unreadEmailNumbers request 를 요청하도록 메시지를 보낸다. 
        if (userSocket === null || userSocket === undefined) {
            return;
        }
        console.log('usersocket:', userSocket.id)
        userSocket.emit('unreadEmailNumbers')
        // io.to(userSocket.id).emit('unreadEmailNumbers')
    })

    // 커넥션이 끊켰을때
    socket.on('forceDisconnect', function () {
        const newClients = clients.filter(client => client !== socket)
        clients = newClients
        console.log('user force disconnected: ', socket.email)
        socket.disconnect()


    })
    socket.on('disconnect', function () {
        const newClients = clients.filter(client => client !== socket)
        clients = newClients
        console.log('user disconnected: ', socket.email)
    })

})

server.listen(PORT, function () {
    console.log(`Socket IO Server listening on port ${PORT}`)
})