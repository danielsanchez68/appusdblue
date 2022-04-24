'use strict';

const express = require('express')
const fs = require('fs')

const config = require('./config.js')
const db = require('./db.js')
const push = require('./push.js')

const app = express()

/* -------- Inicialización del canal de Websocket para este servidor --------- */
const httpServer = require('http').Server(app)
const io = require('socket.io')(httpServer)

io.on('connection', async socket => {
  console.log('Un cliente se ha conectado')

  socket.emit('messages', await db.obtenerMensajes() )

  socket.on('new-message', async mensaje => {
      //mensajes.push(mensaje)
      await db.guardarMensaje(mensaje)
      io.sockets.emit('messages', await db.obtenerMensajes())
  })
})
/* --------------------------------------------------------------------------- */

app.use(express.static('public'))
app.use(express.json())

/* ------------------------------------------------ */
/*                   get vapidKeys                  */
/* ------------------------------------------------ */
app.get('/vapidkeys', async (req,res) => {
  res.json({data: await push.iniVapidKeys()})
})

/* ------------------------------------------------ */
/*               Cantidad suscriptores              */
/* ------------------------------------------------ */
app.get('/suscriptores', async (req,res) => {
  let suscripcions = null

  //console.log('suscripcion',datos)
  try { suscripcions = JSON.parse(await fs.promises.readFile('suscripcions.dat','utf-8')) }
  catch { suscripcions = {} }

  let cantSuscriptores = Object.keys(suscripcions).length
  let detalleSuscriptores = []
  if(cantSuscriptores) {
    //console.log(suscripcions)
    for(let key in suscripcions) {
      //console.log(suscripcions[key])
      detalleSuscriptores.push(suscripcions[key].emailSuscriptor)
    }
  }

  res.json({cantSuscriptores, detalleSuscriptores})
})

/* ------------------------------------------------ */
/*                suscripción nueva                 */
/* ------------------------------------------------ */
app.post('/suscripcion', async(req,res) => {
  let suscripcions = null
  let body = req.body

  let datos = body.datos
  let emailSuscriptor = body.emailSuscriptor

  //console.log('suscripcion', datos)

  try { suscripcions = JSON.parse(await fs.promises.readFile('suscripcions.dat','utf-8')) }
  catch { suscripcions = {} }

  //agrego suscripción
  suscripcions[datos.endpoint] = { ...datos, emailSuscriptor } 

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

;(async () => {
  await db.connect()
  const server = httpServer.listen(PORT, () => console.log(`Servidor express escuchando en el puerto ${PORT}`))
  server.on('error', error => console.log(`ERROR en servidor express: ${error.message}`))
})()

