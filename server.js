'use strict';

const config = require('./config.js')
const util = require('./util.js')
const db = require('./db.js')

const webPush = require('./index.js');
const express = require('express')
const fs = require('fs')

require('./tick.js')

db.connect()

const app = express()

app.use(express.static('public'))
app.use(express.json())

//------------------------------------
//endpoint para recibir las vapid keys
//------------------------------------
let vapidKeys = {}
try {
  vapidKeys = JSON.parse(fs.readFileSync('vapidkeys.dat','utf-8'))
}
catch {
  vapidKeys = {}
}
//console.log('vapidKeys inicial: ', vapidKeys)

app.get('/vapidkeys', (req,res) => {
  vapidKeys = webPush.generateVAPIDKeys();
  fs.writeFile('vapidkeys.dat', JSON.stringify(vapidKeys), () => {
    res.json({data: vapidKeys})
  })
})

//--------------------------------------
//endpoint para realizar una suscripción
//--------------------------------------
let suscripcion
try {
  suscripcion = JSON.parse(fs.readFileSync('suscripcion.dat','utf-8'))
}
catch {
  suscripcion = {}
}
//console.log('suscripcion inicial: ', suscripcion)

app.post('/suscripcion', (req,res) => {
  let datos = req.body
  //console.log(datos)
  suscripcion = datos
  fs.writeFile('suscripcion.dat', JSON.stringify(suscripcion), () => {
    res.json({res: 'ok', suscripcion})
  })
})

//-------------------------------------
//endpoint para enviar una notificación
//-------------------------------------
app.get('/notification', (req,res) => {
  let query = req.query

  //---------------------------------------------
  //verifico que haya suscripción y vapid pedidas
  //---------------------------------------------
  if(!Object.keys(suscripcion).length || !Object.keys(vapidKeys).length) {
    res.json({res: suscripcion})
  }    
  else { 
    //-------------------------
    // Armo objeto subscription
    //-------------------------
    let subscription = {
      endpoint: suscripcion.endpoint,
      keys: {
        p256dh: suscripcion.keys.p256dh || null,
        auth: suscripcion.keys.auth || null
      }
    }
    //-------------
    // Armo payload
    //-------------
    let payload = query.payload || "Mensaje default de notificación"
    
    //--------------------
    // Armo objeto options
    //--------------------
    let options = {
      TTL : suscripcion.expirationTime? suscripcion.expirationTime : 0,
      vapidDetails : {
        subject: query.subject || 'mailto: danielsanchez68@hotmail.com',
        publicKey: vapidKeys.publicKey || null,
        privateKey: vapidKeys.privateKey || null
      }
    }

    //-------------------
    // Envio notificacion
    //-------------------
    webPush.sendNotification(subscription, payload, options)
    .then(() => {
      console.log('Push message sent.');
      res.json({res: 'ok', subscription, payload, options})
    }, err => {
      console.log('Error sending push message: ');
      console.log(err);
      res.json({res: 'error', err})
    })
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

app.get('/data/:starttimestamp/:endtimestamp?', async (req,res) => {
    
  const startTimestamp = Number(req.params.starttimestamp) || 0
  const endTimestamp = Number(req.params.endtimestamp) || 0
  
  const datos = await db.read(startTimestamp, endTimestamp)

  res.json({datos, timestamp: Date.now()})
})


const PORT = process.env.PORT || 8080

const server = app.listen(PORT, () => console.log(`Servidor express escuchando en el puerto ${PORT}`))
server.on('error', error => console.log(`Error en servidor express: ${error.message}`))


