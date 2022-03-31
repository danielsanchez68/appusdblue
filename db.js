import mongoose from 'mongoose'
import util from './util.js';
import config from './config.js';

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
            //console.log('dolarBlue', dolar)
            await save(dolar)

            /*
            const datos = await read()
            //console.log(datos.length)
            const datosArray = datos.map( dato => dato.dolar)
            const ultimos = datosArray.slice(-5)
            console.log(ultimos, ultimos.length)
            */
        },config.TMS_GETDOLARAPI)

    }
    catch(error) {
        console.log(`Error en conexión de base de datos ${error.message}`)
    }
}

const save = async dolar => {
    const DolarSave = new DolarModel({dolar, timestamp: Date.now()})
    await DolarSave.save()
}

const read = async (timestamp, cant) => {
    let timestampActual = new Date().getTime()
    let timestampIni = timestamp? timestamp : (timestampActual - (60000 * cant))
    let timestampFin = timestamp? (timestamp+(60000 * cant)) : timestampActual

    //console.log(cant, timestamp, timestampFin, timestampIni)
    //console.log(timestampFin - timestampIni)

    return await DolarModel.find({timestamp: {$gte:timestampIni, $lte:timestampFin}},{__v:0,_id:0}).lean()
}


export default {
    connect,
    read
}
