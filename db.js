const mongoose = require('mongoose')
const util = require('./util.js')
const config = require('./config.js')

const DolarSchema = mongoose.Schema({
    dolar: Number,
    timestamp: Number
})

const DolarModel = mongoose.model('blue', DolarSchema)

const connect = async () => {
    try {
        await mongoose.connect(config.URL_BASE);
        console.log('Base de datos conectada')

        setInterval(async () => {
            let dolar = await util.getDolarBlue()
            await save(dolar)
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


module.exports = {
    connect,
    read
}
