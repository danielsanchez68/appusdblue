'use strict';

const config = require('./config.js')
const db = require('./db.js')

const express = require('express')
const fs = require('fs')

const push = require('./push.js')

require('./tick.js')

db.connect()

const app = express()

app.use(express.static('public'))
app.use(express.json())


/* ------------------------------------------------ */
/*                   get vapidKeys                  */
/* ------------------------------------------------ */
app.get('/vapidkeys', (req,res) => {
  res.json({data: push.vapidKeys})
})

/* ------------------------------------------------ */
/*               Cantidad suscriptores              */
/* ------------------------------------------------ */
app.get('/cs', async (req,res) => {
  let suscripcions = null

  //console.log('suscripcion',datos)
  try { suscripcions = JSON.parse(await fs.promises.readFile('suscripcions.dat','utf-8')) }
  catch { suscripcions = {} }

  res.json({cantSuscriptores: Object.keys(suscripcions).length})
})

/* ------------------------------------------------ */
/*                suscripción nueva                 */
/* ------------------------------------------------ */
app.post('/suscripcion', async(req,res) => {
  let suscripcions = null
  let datos = req.body

  //console.log('suscripcion',datos)
  try { suscripcions = JSON.parse(await fs.promises.readFile('suscripcions.dat','utf-8')) }
  catch { suscripcions = {} }

  //agrego suscripción
  suscripcions[datos.endpoint] = datos

  await fs.promises.writeFile('suscripcions.dat', JSON.stringify(suscripcions))
  res.json({res: 'ok suscription', datos})
})

/* ------------------------------------------------ */
/*                  desuscripción                   */
/* ------------------------------------------------ */
app.post('/desuscripcion', async (req,res) => {
  let suscripcions = null
  let datos = req.body

  //console.log('desuscripcion',datos)
  try { suscripcions = JSON.parse(await fs.promises.readFile('suscripcions.dat','utf-8')) }
  catch { suscripcions = {} }

  //borro suscripción
  delete suscripcions[datos.endpoint]

  await fs.promises.writeFile('suscripcions.dat', JSON.stringify(suscripcions))
  res.json({res: 'ok desuscripcion', datos})
})


/* ------------------------------------------------ */
/*        endpoint para enviar una notificación     */
/* ------------------------------------------------ */
app.get('/notification', async (req,res) => {
  let query = req.query
  const [haySuscripcions,subscription, payload, options, errores] = await push.enviarNotificacionPush(query.payload)

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
  res.sendFile(__dirname + '/views/notificacion.html')
})

app.get('/data/:starttimestamp/:endtimestamp?', async (req,res) => {
    
  const startTimestamp = Number(req.params.starttimestamp) || 0
  const endTimestamp = Number(req.params.endtimestamp) || 0
  
  const datos = await db.read(startTimestamp, endTimestamp)

  res.json({datos, timestamp: Date.now()})
})


const PORT = process.env.PORT || 8080

const server = app.listen(PORT, () => console.log(`Servidor express escuchando en el puerto ${PORT}`))
server.on('error', error => console.log(`ERROR en servidor express: ${error.message}`))


