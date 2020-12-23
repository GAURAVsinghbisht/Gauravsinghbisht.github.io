const socket = io() // function to connect to socket , this function we get from client side library of socket


const $chatForm = document.querySelector('#message-form')
const $msgField = $chatForm.querySelector('input')
const $formButton = $chatForm.querySelector('button')
const $shareLocationBtn = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
//listening to event sent from server using on function and event is message
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


// extracting query parameter using qs library

const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})
// location.search that is accessable globally in browser gives query parameters

const autoscroll = ()=>{
    // new message element
    $newMessage = $messages.lastElementChild

    // Height of new message

    const newessageStyles = getComputedStyle($newMessage); // getting all css style applied automatically by browser
    const newMessageMargin = parseInt(newessageStyles.marginBottom) // finding margin bottom of new msg
    const newMessaeHeight = $newMessage.offsetHeight + newMessageMargin // total height

    // visible height
    const visibleHeight = $messages.offsetHeight

    // hieght of message container

    const containerHeight = $messages.scrollHeight

    // how far i have srolled ?

    const scrollOffset  = $messages.scrollTop + visibleHeight;
    if(containerHeight - newMessaeHeight <= scrollOffset){
        $messages.scrollTop = containerHeight;
    }

}


socket.on('message',(data)=>{
    const html = Mustache.render(messageTemplate,{
        username:data.username,
        message: data.text,
        createdAt : moment(data.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll();
})

$chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();

    $formButton.setAttribute('disabled','disabled') // disable submit button
    const msg = e.target.elements.message.value // inside target property i.e an object there is another
    // property 'elements' which contain all the form field by name


    socket.emit('sendMessage',msg,(error)=>{  // 3rd argument is a callaback for acknowledgment purpose
        $formButton.removeAttribute('disabled')  // enable submit button
        $msgField.value = '';  // empty the field value
        $msgField.focus()

        if(error){
            return alert('Profanity is now allowed')
        }
    }); // sending data back to server using emit method and sendMessage event
})

$shareLocationBtn.addEventListener('click',()=>{

    if(!navigator.geolocation){
        return alert('Your browser do not support geolocation.')
    }
    $shareLocationBtn.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        if(position.coords){
           socket.emit('sendLocation',{
               latitude:position.coords.latitude,
               longitude: position.coords.longitude
           },()=>{
               $shareLocationBtn.removeAttribute('disabled')
           })
        }
    })
})

socket.on('locationMessage',(data)=>{
    const html = Mustache.render(locationTemplate,{
       username:data.username,
       url:  data.url,
       createdAt: moment(data.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll();
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
    }
});

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


