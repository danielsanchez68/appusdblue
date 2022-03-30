import axios from "axios"

setInterval(async () => {
    console.log((await axios('https://appusdblue.herokuapp.com/')).status)
},60000)
