const webPush = require('./libpush/index.js');
const fs = require('fs')

let vapidKeys = (async () => {
    return await iniVapidKeys()
})()

async function iniVapidKeys() {
    let vapidKeys = {}
    try {
        vapidKeys = JSON.parse(await fs.promises.readFile('vapidkeys.dat', 'utf-8'))
    }
    catch {
        vapidKeys = webPush.generateVAPIDKeys();
        await fs.promises.writeFile('vapidkeys.dat', JSON.stringify(vapidKeys))
        //console.log('vapidKeys inicial: ', vapidKeys)
        console.log('Generando vapidKeys...')
    }

    console.log('vapidKeys:',vapidKeys)
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
        suscripcions = JSON.parse(await fs.promises.readFile('suscripcions.dat', 'utf-8'))
        const vapidKeys = JSON.parse(await fs.promises.readFile('vapidkeys.dat', 'utf-8'))

        //console.log(suscripcions)
        //console.log('mensaje', mensaje)
        let contEnvios = 0
        for (let key in suscripcions) {
            haySuscripcions = true

            let suscripcion = suscripcions[key]
            //console.log(suscripcion)
            //---------------------------------------------
            //verifico que haya suscripción y vapid pedidas
            //---------------------------------------------
            if (!Object.keys(suscripcion).length || !Object.keys(vapidKeys).length) {
                res.json({ res: 'error', err })
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
                    TTL: suscripcion.expirationTime ? suscripcion.expirationTime : 0,
                    vapidDetails: {
                        //subject: query.subject || 'mailto: danielsanchez68@hotmail.com',
                        subject: 'mailto: danielsanchez68@hotmail.com',
                        publicKey: vapidKeys.publicKey || null,
                        privateKey: vapidKeys.privateKey || null
                    }
                }

                //-------------------
                // Envio notificacion
                //-------------------
                try {
                    await webPush.sendNotification(subscription, payload, options)
                    console.log(`${++contEnvios} - OK Push message sent [${subscription.endpoint}]`);
                    //res.json({res: 'ok', subscription, payload, options})
                }
                catch (err) {
                    console.log('ERROR sending push message: ', subscription.endpoint, err,);
                    errores.push(err)
                    //console.log(err);
                    //res.json({res: 'error', err})
                }
            }
        }
    }
    catch (error) {
        console.log('ERROR enviarNotificacionPush', error.message)
    }

    return [haySuscripcions, subscription, payload, options, errores]
}

module.exports = {
    vapidKeys,
    enviarNotificacionPush
}
