const axios = require('axios')
const cheerio = require('cheerio')

/* const getBlue = async () => {
    const { data:respuesta } = await axios('https://www.dolarsi.com/api/api.php?type=valoresprincipales')
    const dolarBlue = Number(respuesta.find(dato => dato.casa.nombre == 'Dolar Blue').casa.venta.replace(',','.'))    
    return dolarBlue
} */

/* const getBlue = async () => {
    const { data:respuesta } = await axios('https://api.bluelytics.com.ar/v2/latest')
    const dolarBlue = Number(respuesta.blue.value_sell)
    return dolarBlue
} */

//https://geekflare.com/es/web-scraping-in-javascript/
/* const getBlue = async () => {
    const { data:respuesta } = await axios('https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB')
    const $ = cheerio.load(respuesta)
    const dolarBlue = Number($('.value').text().split('$')[2].replace(',','.'))
    //console.log(dolarBlue)
    return dolarBlue
} */

//https://www.valordolarblue.com.ar/
const getBlue = async () => {
    const { data:respuesta } = await axios('https://www.valordolarblue.com.ar/')
    const $ = cheerio.load(respuesta)
    //console.log($('.box_data.dolar_blue .values [title="Precio de venta del Dólar Blue en la Argentina"].value strong').text())
    const dolarBlue = Number($('.box_data.dolar_blue .values [title="Precio de venta del Dólar Blue en la Argentina"].value strong').text().replace(',','.'))
    //console.log(dolarBlue)
    return dolarBlue
}


module.exports = {
    getBlue
}
