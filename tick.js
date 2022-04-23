const axios = require("axios")

setInterval(async () => {
    try {
        //console.log((await axios('https://appusdblue.herokuapp.com/')).status)
        console.log('Tick alive...')
        console.log((await axios('https://appusdblue2.glitch.me/')).status)
    }
    catch(error) {
        console.log(error.message)
    }
},60000)
