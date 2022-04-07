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

app.get('/data/:starttimestamp/:endtimestamp?', async (req,res) => {
    
    const startTimestamp = Number(req.params.starttimestamp) || 0
    const endTimestamp = Number(req.params.endtimestamp) || 0
    
    const datos = await db.read(startTimestamp, endTimestamp)

    res.json({datos, timestamp: Date.now()})
})


const PORT = process.env.PORT || 8080

const server = app.listen(PORT, () => console.log(`Servidor express escuchando en el puerto ${PORT}`))
server.on('error', error => console.log(`Error en servidor express: ${error.message}`))

