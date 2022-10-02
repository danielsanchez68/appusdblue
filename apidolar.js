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
/* const getBlue = async () => {
    const { data:respuesta } = await axios('https://www.valordolarblue.com.ar/')
    const $ = cheerio.load(respuesta)
    //console.log($('.box_data.dolar_blue .values [title="Precio de venta del Dólar Blue en la Argentina"].value strong').text())
    const dolarBlue = Number($('.box_data.dolar_blue .values [title="Precio de venta del Dólar Blue en la Argentina"].value strong').text().replace(',','.'))
    //console.log(dolarBlue)
    return dolarBlue
} */


//https://www.infobae.com/economia/divisas/dolar-hoy/
/* const getBlue = async () => {
    const { data:respuesta } = await axios('https://www.infobae.com/economia/divisas/dolar-hoy/')
    const $ = cheerio.load(respuesta)
    //console.log($('a[href="https://www.infobae.com/tag/dolar-libre"] .exc-val').text())

    const dolarBlue = Number($('a[href="https://www.infobae.com/tag/dolar-libre"] .exc-val').text())
    console.log('dolarBlue:', dolarBlue)
    return dolarBlue
    //return 212.6
} */

//<a href="/MercadosOnline/moneda.html?id=ARSB"><div class="sell-wrapper"><div class="sell-text">Venta</div><div class="sell-value"><span class="currency">$</span>288,00</div></div></a>

//https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB
const getBlue = async () => {
    const { data:respuesta } = await axios('https://www.cronista.com/MercadosOnline/moneda.html?id=ARSB')
    //console.log(respuesta)
    const $ = cheerio.load(respuesta)

    const dolarBlue = Number($('a[href="/MercadosOnline/moneda.html?id=ARSB"] .sell-wrapper .sell-value').text().slice(1).replace(',','.'))
    console.log('dolarBlue:', dolarBlue)
    return dolarBlue
    //return 212.6
}



module.exports = {
    getBlue
}
