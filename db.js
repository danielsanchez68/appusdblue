const mongoose = require('mongoose')
const util = require('./util.js')
const config = require('./config.js')

const webPush = require('./index.js');
const fs = require('fs')

const DolarSchema = mongoose.Schema({
    dolar: Number,
    timestamp: Number
})

const DolarModel = mongoose.model('blue', DolarSchema)

const connect = async () => {
    try {
        await mongoose.connect(config.URL_BASE);
        console.log('Base de datos conectada')

        let dolarAnt = 0

        setInterval(async () => {
            let dolar = await util.getDolarBlue()
            console.log(dolar)
            await save(dolar)
            if((dolar != dolarAnt) && dolarAnt) {
                const mensaje = `cambío el dolar de $${dolarAnt} a $${dolar}`
                //const mensaje = `cambío el dolar a $${dolar}`
                console.log(mensaje)
                await enviarNotificacionPush(mensaje)
                dolarAnt = dolar
            }
        },config.TMS_GETDOLARAPI)

    }
    catch(error) {
        console.log(`Error en conexión de base de datos ${error.message}`)
    }
}

const save = async dolar => {
    //return    
    const DolarSave = new DolarModel({dolar, timestamp: Date.now()})
    await DolarSave.save()
}

const read = async (starttimestamp, endtimestamp) => {
    const cant = 60 // en segundos
    let timestampActual = new Date().getTime()
    let timestampIni = starttimestamp && endtimestamp? starttimestamp : (timestampActual - (60000 * cant))
    let timestampFin = starttimestamp && endtimestamp? endtimestamp: timestampActual

    return await DolarModel.find({timestamp: {$gte:timestampIni, $lte:timestampFin}},{__v:0,_id:0}).lean()
}


async function iniVapidKeys() {
  let vapidKeys = {}
  try {
    vapidKeys = JSON.parse(await fs.promises.readFile('vapidkeys.dat','utf-8'))
  }
  catch {
    vapidKeys = webPush.generateVAPIDKeys();
    await fs.promises.writeFile('vapidkeys.dat', JSON.stringify(vapidKeys))
    console.log('vapidKeys inicial: ', vapidKeys)
  }

  return vapidKeys
}

async function enviarNotificacionPush(mensaje) {
    let suscripcions = null
    let subscription
    let payload
    let options
    let haySuscripcions = false
    let errores = []
  
    //console.log('desuscripcion',datos)
    try { 
        suscripcions = JSON.parse(await fs.promises.readFile('suscripcions.dat','utf-8')) 
        const vapidKeys = JSON.parse(await fs.promises.readFile('vapidkeys.dat','utf-8'))

        //console.log(suscripcions)
        //console.log('mensaje', mensaje)
    
        for(let key in suscripcions) {
          haySuscripcions = true
      
          let suscripcion = suscripcions[key]
          //console.log(suscripcion)
          //---------------------------------------------
          //verifico que haya suscripción y vapid pedidas
          //---------------------------------------------
          if(!Object.keys(suscripcion).length || !Object.keys(vapidKeys).length) {
            res.json({res: 'error', err})
            //res.json({res: suscripcion})
          }    
          else { 
            //-------------------------
            // Armo objeto subscription
            //-------------------------
            subscription = {
              endpoint: suscripcion.endpoint,
              keys: {
                p256dh: suscripcion.keys.p256dh || null,
                auth: suscripcion.keys.auth || null
              }
            }
            //-------------
            // Armo payload
            //-------------
            //payload = query.payload || "Mensaje default de notificación"
            payload = mensaje || "Mensaje default de notificación"
            
            //--------------------
            // Armo objeto options
            //--------------------
            options = {
              TTL : suscripcion.expirationTime? suscripcion.expirationTime : 0,
              vapidDetails : {
                //subject: query.subject || 'mailto: danielsanchez68@hotmail.com',
                subject: 'mailto: danielsanchez68@hotmail.com',
                publicKey: vapidKeys.publicKey || null,
                privateKey: vapidKeys.privateKey || null
              }
            }
      
            //-------------------
            // Envio notificacion
            //-------------------
            webPush.sendNotification(subscription, payload, options)
            .then(() => {
              console.log('Push message sent.', subscription.endpoint);
              //res.json({res: 'ok', subscription, payload, options})
            }, err => {
              console.log('Error sending push message: ', subscription.endpoint, err, );
              errores.push(err)
              //console.log(err);
              //res.json({res: 'error', err})
            })
          }
        }
    }
    catch(error) {
        console.log('enviarNotificacionPush', error.message)
    }
  
    return [haySuscripcions,subscription, payload, options, errores]
}

module.exports = {
    connect,
    read,
    iniVapidKeys,
    enviarNotificacionPush
}
