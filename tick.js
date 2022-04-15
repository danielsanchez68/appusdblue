const axios = require("axios")

setInterval(async () => {
    //console.log((await axios('https://appusdblue.herokuapp.com/')).status)
    console.log((await axios('https://appusdblue.glitch.me/')).status)
},60000)
