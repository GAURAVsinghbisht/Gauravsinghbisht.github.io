const socket = io() // function to connect to socket , this function we get from client side library of socket

// it initialize the connection
// socket is the same object we using in server help us to send and recieve events
socket.on('countUpdated',(count)=>{
    console.log('count updated: ',count)
})
//
document.querySelector('#increment').addEventListener('click',()=>{
    socket.emit('incrementCount')
})