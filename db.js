import mongoose from 'mongoose'
import util from './util.js';
import config from './config.js';

const URL_BASE = 'mongodb://localhost/dolar'
//const URL_BASE = 'mongodb+srv://daniel:daniel123@misdatos.fs00f.mongodb.net/dolar?retryWrites=true&w=majority'

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

const read = async timestamp => {
    return await DolarModel.find({timestamp: {$gte:timestamp}},{__v:0,_id:0}).lean()
}


export default {
    connect,
    read
}
