async function iniRepreData() {
    //tomo la versión y la represnto
    const { data: rta } = await axios('/version')
    document.getElementById('version').innerText = rta.version

    //acción del botón de borrar
    document.getElementById('borrar').onclick = function () {
        document.getElementById('start-time').value = ''
        document.getElementById('end-time').value = ''
        document.getElementById('step-min').value = ''
    }
}


let respuesta
let startTimestampAnt = true
let endTimestampAnt = true
let contPedido = 0

async function tickRepreData() {
    //tomo la hora del input y muestro el modo de operación
    const startTime = document.getElementById('start-time').value
    const startTimestamp = new Date(startTime).getTime() || 0

    const endTime = document.getElementById('end-time').value
    const endTimestamp = new Date(endTime).getTime() || 0

    contPedido++
    //console.log(contPedido)
    /* console.log(startTimestamp, startTimestampAnt )
    console.log(endTimestamp, endTimestampAnt )
    console.log(startTimestamp != startTimestampAnt )
    console.log(endTimestamp != endTimestampAnt ) */

    //petición de los datos al backend
    if (
        (!startTimestamp && !endTimestamp && (contPedido >= 60)) ||
        (startTimestamp != startTimestampAnt) ||
        (endTimestamp != endTimestampAnt)
    ) {
        console.log('Pidiendo...', Date.now())
        const { data: rta } = await axios(`/data/${startTimestamp}/${endTimestamp}/`)
        respuesta = rta

        startTimestampAnt = startTimestamp
        endTimestampAnt = endTimestamp

        contPedido = 0
    }

    if (respuesta) {
        const datos = respuesta.datos
        const valorVentaActual = datos[datos.length - 1]?.dolar || '?'
        const tsvalorVentaActual = datos[datos.length - 1]?.timestamp || '?'

        //tomo el step de minutos
        let stepMin = document.getElementById('step-min').value

        if (datos.length >= 1000 && datos.length < 5000 && stepMin < 5) stepMin = 5
        if (datos.length >= 5000 && datos.length < 10000 && stepMin < 10) stepMin = 10
        if (datos.length >= 10000 && stepMin < 20) stepMin = 20

        document.getElementById('valor-venta').innerHTML =
            `$${valorVentaActual} <i>(${new Date(tsvalorVentaActual).toLocaleString()})</i>`

        document.getElementById('modo').innerText = startTimestamp && endTimestamp ?
            `Mostrando desde fecha inicial: ${new Date(startTime).toLocaleString()} hasta fecha final: ${new Date(endTime).toLocaleString()}` :
            `Mostrando última hora`

        document.getElementById('modo').innerText += ` en pasos de ${stepMin ? stepMin : 1} minuto(s)`


        graf(datos, stepMin && stepMin != 0 ? stepMin : 1)
    }

    //represento la hora actual
    document.getElementById('fyh').innerText = new Date().toLocaleString()
}

async function repreData() {

    await iniRepreData()
    await tickRepreData()

    setInterval(async () => {
        await tickRepreData()
    }, 1000)
}

function timestamp2fyh(dato) {
    let fh = dato.split(' ')
    let f = fh[0]
    let h = fh[1]

    let dma = f.split('/')
    let hms = h.split(':')

    //return `${dma[0]}/${dma[1]} ${hms[0]}:${hms[1]}:${hms[2]}`
    return `${dma[0]}/${dma[1]} ${hms[0]}:${hms[1]}`
}

const graf = (datosin, step) => {
    //console.log(datosin)

    if (datosin.length && (typeof datosin[0] != 'undefined')) {

        const datos = datosin.filter((dato, index) => index % step == 0)
        datos.push(datosin[datosin.length - 1])

        document.getElementById('msg-error').innerHTML = ''
        document.getElementById('myDiv').style.display = 'block'


        const fyh = datos.map(dato => timestamp2fyh(new Date(dato.timestamp).toLocaleString()))
        const dolars = datos.map(dato => dato.dolar)

        var trace = {
            x: fyh,
            y: dolars,
            mode: 'lines+markers'
            //type: 'scatter'
        };

        var data = [trace];

        var layout = {
            title: '<b>Dolar histórico</b>',
            xaxis: {
                showline: true,
                showgrid: true,
                showticklabels: true,
                linecolor: 'rgb(204,204,204)',
                linewidth: 2,
                autotick: false,
                ticks: 'outside',
                tickcolor: 'rgb(204,204,204)',
                tickwidth: 2,
                ticklen: 5,
                tickfont: {
                    family: 'Arial',
                    size: 10,
                    color: 'rgb(82, 82, 82)'
                }
            },
            yaxis: {
                showgrid: true,
                zeroline: true,
                showline: true,
                showticklabels: true,
                linecolor: 'rgb(204,204,204)',
            },
        };

        Plotly.newPlot('myDiv', data, layout);

    }
    else {
        document.getElementById('myDiv').style.display = 'none'
        document.getElementById('msg-error').innerHTML = '<h2>No se encontraron datos</h2>'
    }
}


function registrarServiceWorker() {
    if ('serviceWorker' in navigator) {
        this.navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                console.log('El service worker se registró correctamente', reg)

                notificaciones.initialiseUI(reg)

                //Pedimos permiso al sistema operativo para permitir ventanas de notificación emergentes
                Notification.requestPermission(function (result) {
                    if (result === 'granted') {
                        navigator.serviceWorker.ready.then(function (registration) {
                            console.log(registration)
                        });
                    }
                });

                //skip waiting automático
                reg.onupdatefound = () => {
                    const installingWorker = reg.installing
                    installingWorker.onstatechange = () => {
                        console.log('SW ---> ', installingWorker.state)
                        if (installingWorker.state == 'activated') {
                            console.log('reinicio en 2 segundos ...')
                            setTimeout(() => {
                                console.log('OK!')
                                location.reload()
                            }, 2000)
                        }
                    }
                }
            })
            .catch(err => {
                console.log('Error al registrar el service worker', err)
            })
    }
    else {
        console.error('serviceWorker no está disponible en este navegador')
    }
}

function start() {
    console.log('start...')
    registrarServiceWorker()
    repreData()
}

window.onload = start