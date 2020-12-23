const express = require('express');
const http = require('http')
const path = require('path');
const socketio = require('socket.io')
const Filter = require('bad-words')
const {genrateMessage,generateLocationMessage} = require('./utils/messages')
const  {addUser, removeUser,getUser,getUsersInRoom} = require('./utils/users')

const app = express()

const server  = http.createServer(app) // passing application explicitly to raw http server, which implicitly happen in background
const io = socketio(server) // passing server to new instance of socketio , so that it can work with that server
const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public'); // giving absolute path of public dir
app.use(express.static(publicDirPath))
//
// let count = 0;
//
// // socket is the object which contain the data coming in connection from client
// io.on('connection',(socket)=>{  // event and function run when event occur
//
//     // everytime a new connection request came we send updated count value to him
//     socket.emit('countUpdated',count) // sending response using emit and passing event to it
//     // 2nd argument will be access to us on client side in callback function
//
//     // on is used for listning event
//     socket.on('incrementCount',()=>{
//         count++;
//         // socket.emit('countUpdated',count); // again sending data back to client
//         // socket.emit only emit to the client from where connection request is comming
//         //if we want to update every client connected to server we use seame event on io
//         io.emit('countUpdated',count);
//     })
// })



io.on('connection',(socket)=>{
    // sending data to new connection using event
    // socket.emit('message','Welcome')


    // socket.id is unique id a client get when connected to a socket
    socket.on('join',({username,room},callback)=>{
       const {error,user} =  addUser({id:socket.id,username,room}) // using spread operator
        if(error){
            return callback(error)
        }
        socket.join(user.room) // join function id specific to server side, we pass a secific room name
        socket.emit('message', genrateMessage('Admin','Welcome')) // emit to that paticular connection,
        // we can pass as many values as args or a object
        socket.broadcast.to(user.room).emit('message',genrateMessage('Admin',`${user.username} has joined`)) // emit to everyone except that particular connection
        io.to(user.room).emit('roomData',{
            room:user.room,
            users: getUsersInRoom(user.room)
        })
        callback()

    })
    socket.on('sendMessage',(msg,callback)=>{
        filter = new Filter();
        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('message',genrateMessage(user.username,msg))  // emit to everyone in connection
        callback();


    })



    socket.on('sendLocation',(data,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,data))
        callback();


    })

    socket.on('disconnect',()=>{  // built in event when a connection for a client end
        const {error,user} = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message',genrateMessage('Admin',`${user.username} has left.`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

})


// server(emit) -> client (recieve)  countUpdated
// client(emit) -> server (recieve) incrementCount



// server(emit) -> client (recieve)  -- acknowledgement --> server
// client(emit) -> server (recieve)  -- acknowledgement --> client

server.listen(port, ()=>{
    console.log(`Server is up & listening on port ${port}`)
})

//io.to.emit -> send to every client of particular room
//socket.broadcast.to.emit -> send to every connected client in a room except the specific client