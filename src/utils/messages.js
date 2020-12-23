const genrateMessage = (username,text)=>{
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username,data)=>{
    return {
        username,
        url : `https://google.com/maps?q=${data.latitude},${data.longitude}`,
        createdAt : new Date().getTime()
    }
}

module.exports = {
    genrateMessage,
    generateLocationMessage
}