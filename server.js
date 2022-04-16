'use strict';

const config = require('./config.js')
const util = require('./util.js')
const db = require('./db.js')

const express = require('express')
const fs = require('fs')

require('./tick.js')

db.connect()

const app = express()

app.use(express.static('public'))
app.use(express.json())


;(async () => {
  const vapidKeys = await db.iniVapidKeys()
  console.log('vapidKeys:',vapidKeys)
})()

app.get('/vapidkeys', (req,res) => {
  res.json({data: vapidKeys})
})


app.post('/suscripcion', (req,res) => {
  let suscripcions = null
  let datos = req.body

  //console.log('suscripcion',datos)
  try { suscripcions = JSON.parse(fs.readFileSync('suscripcions.dat','utf-8')) }
  catch { suscripcions = {} }

  //agrego suscripción
  suscripcions[datos.endpoint] = datos

  fs.writeFile('suscripcions.dat', JSON.stringify(suscripcions), () => {
    res.json({res: 'ok suscription', datos})
  })
})


app.post('/desuscripcion', (req,res) => {
  let suscripcions = null
  let datos = req.body

  //console.log('desuscripcion',datos)
  try { suscripcions = JSON.parse(fs.readFileSync('suscripcions.dat','utf-8')) }
  catch { suscripcions = {} }

  //borro suscripción
  delete suscripcions[datos.endpoint]

  fs.writeFile('suscripcions.dat', JSON.stringify(suscripcions), () => {
    res.json({res: 'ok desuscripcion', datos})
  })
})


//-------------------------------------
//endpoint para enviar una notificación
//-------------------------------------
app.get('/notification', async (req,res) => {
  let query = req.query
  const [haySuscripcions,subscription, payload, options, errores] = await db.enviarNotificacionPush(query.payload)

  if(!errores.length && haySuscripcions) {
    res.json({res: 'ok', subscription, payload, options})
  }
  else {
    res.json({res: 'error', errores})
  }
})

/*  ------------------ ENDPOINTS DE LA APP ------------------ */
app.get('/ping', (req,res) => {
  res.send('pong')
})

app.get('/version', (req,res) => {
  res.json({ version: config.VERSION })
})

app.get('/test', async (req,res) => {
  res.json({dolarBlue: await util.getDolarBlue(), timestamp: Date.now()})
})

app.get('/push', async (req,res) => {
  res.sendFile(__dirname + '/public/notificacion.html')
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


