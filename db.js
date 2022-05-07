const mongoose = require('mongoose')
const apidolar = require('./apidolar.js')
const config = require('./config.js')
const push = require('./push.js')

let conexion = false

const connect = async () => {
    try {
        console.log('Conectando a la base de datos...')
        await mongoose.connect(config.URL_BASE);
        console.log('Base de datos conectada')
        conexion = true

        let dolarAnt = 0

        setInterval(async () => {
            try {
                let dolar = await apidolar.getBlue()

                if(dolar != 0) {
                    //console.log(dolar)
                    await save(dolar)
                    if(dolar != dolarAnt) {
                        const mensaje = `Cambió el dolar de $${dolarAnt} a $${dolar}`
                        console.log(mensaje)

                        if(dolarAnt) {
                        console.log('> Enviando notificación ...')
                        const [haySuscripcions,subscription, payload, options, errores] = await push.enviarNotificacionPush(mensaje)

                        if(!errores.length && haySuscripcions) {
                            console.log({res: 'ok', subscription, payload, options})
                        }
                        else {
                            console.log({res: 'ERROR', errores})
                        }
                        }
                        dolarAnt = dolar
                    }
                }
            }
            catch(error) {
                console.log(`Error en setInterval TMS_GETDOLARAPI: ${error.message}`)
            }
        },config.TMS_GETDOLARAPI)

    }
    catch(error) {
        console.log(`ERROR en conexión de base de datos ${error.message}`)
    }
}

/* ------------------- DB DOLAR -------------------- */
//Modelo de dato dolar
const DolarSchema = mongoose.Schema({
    dolar: Number,
    timestamp: Number
})
const DolarModel = mongoose.model('blue', DolarSchema)


const save = async dolar => {
    //return
    if(!conexion) return

    const DolarSave = new DolarModel({dolar, timestamp: Date.now()})
    await DolarSave.save()
}

const read = async (starttimestamp, endtimestamp, stepMin) => {
    if(!conexion) return

    const cant = 60 // en segundos
    let timestampActual = new Date().getTime()
    let timestampIni = starttimestamp && endtimestamp? starttimestamp : (timestampActual - (60000 * cant))
    let timestampFin = starttimestamp && endtimestamp? endtimestamp: timestampActual

    let tiempoTranscurridoEnMinutos = (timestampFin - timestampIni) / 60000
    //console.log('tiempoTranscurridoEnMinutos', tiempoTranscurridoEnMinutos)

    if (tiempoTranscurridoEnMinutos >= 1000 && tiempoTranscurridoEnMinutos < 5000 && stepMin < 5) stepMin = 5
    if (tiempoTranscurridoEnMinutos >= 5000 && tiempoTranscurridoEnMinutos < 10000 && stepMin < 10) stepMin = 10
    if (tiempoTranscurridoEnMinutos >= 10000 && tiempoTranscurridoEnMinutos < 15000 && stepMin < 20) stepMin = 20
    if (tiempoTranscurridoEnMinutos >= 15000 && tiempoTranscurridoEnMinutos < 20000 && stepMin < 30) stepMin = 30
    if (tiempoTranscurridoEnMinutos >= 20000 && tiempoTranscurridoEnMinutos < 50000 && stepMin < 60) stepMin = 60
    if (tiempoTranscurridoEnMinutos >= 50000 && stepMin < 120) stepMin = 120

    //return await DolarModel.find({timestamp: {$gte:timestampIni, $lte:timestampFin}},{__v:0,_id:0}).lean()

    const INTERVALO_EN_MINUTOS = stepMin || 1
    //console.log('INTERVALO_EN_MINUTOS:', INTERVALO_EN_MINUTOS)

    return await DolarModel.aggregate([
        { $match: { timestamp: { $gte: timestampIni, $lte: timestampFin } } },
        { $project: { 
                _id:0,
                dolar: 1,
                timestamp: 1,
                multiplo: { $mod : [{ $floor: { $divide:  ['$timestamp', 60000] } } , INTERVALO_EN_MINUTOS ] },
                stepMin : { $multiply: [ INTERVALO_EN_MINUTOS, 1] }
            } 
        },
        { $match: { multiplo: 0 } }
    ])
    
}

/* ------------------- DB CHAT -------------------- */
//Modelo de mensaje chat
const mensajeSchema = mongoose.Schema({
    usuario : String,                     
    texto : String
})
const MensajeModel = mongoose.model('mensajes', mensajeSchema)

async function obtenerMensajes() {
    if(!conexion) return []

    try {
        let mensajes = await MensajeModel.find({}).lean()
        //console.log(mensajes[0]._id.getTimestamp())
        for(let i=0; i<mensajes.length; i++) {
            mensajes[i].timestamp = mensajes[i]._id.getTimestamp()
        }
        return mensajes
    }
    catch(err) {
        console.log(`Error en read de mensajes: ${err.message}`)
        return []
    }
}

async function guardarMensaje(mensaje) {
    if(!conexion) return {}

    //console.log(mensaje)
    try {
        const mensajeModel = new MensajeModel(mensaje)
        await mensajeModel.save()
        return mensaje
    }
    catch(err) {
        console.log(`Error en create de mensajes: ${err.message}`)
    }
}

module.exports = {
    connect,
    read,
    obtenerMensajes,
    guardarMensaje,
}
