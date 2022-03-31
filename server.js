import express from 'express'
import db from './db.js';
import util from './util.js';
import './tick.js'
import config from './config.js';

db.connect()

const app = express()

app.use(express.static('public'))

app.get('/ping', (req,res) => {
    res.send('pong')
})

app.get('/test', async (req,res) => {
    res.json({dolarBlue: await util.getDolarBlue(), timestamp: Date.now()})
})

app.get('/version', (req,res) => {
    res.json({ version: config.VERSION })
})

app.get('/data/:cant?/:timestamp?', async (req,res) => {
    
    //let t1 = new Date()
    const cant = Number(req.params.cant) || 5
    const timestamp = Number(req.params.timestamp) || 0
    //console.log('timestamp',timestamp)
    const datos = await db.read(timestamp, cant)
    //console.log('datos.length', datos.length)
    //let t2 = new Date()
    const ultimos = datos//timestamp? datos.slice(0,cant) : datos.slice(-cant)
    //console.log('tiempo transcurrido', t2 - t1)

    //console.log(ultimos, ultimos.length)
    res.json({ultimos, timestamp: Date.now()})
})


const PORT = process.env.PORT || 8080

const server = app.listen(PORT, () => console.log(`Servidor express escuchando en el puerto ${PORT}`))
server.on('error', error => console.log(`Error en servidor express: ${error.message}`))

