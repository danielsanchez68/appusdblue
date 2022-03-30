import axios from 'axios'

/* const getDolarBlue = async () => {
    const { data:respuesta } = await axios('https://www.dolarsi.com/api/api.php?type=valoresprincipales')
    const dolarBlue = Number(respuesta.find(dato => dato.casa.nombre == 'Dolar Blue').casa.venta.replace(',','.'))    
    return dolarBlue
} */

const getDolarBlue = async () => {
    const { data:respuesta } = await axios('https://api.bluelytics.com.ar/v2/latest')
    const dolarBlue = Number(respuesta.blue.value_sell)
    return dolarBlue
}



export default {
    getDolarBlue
}
