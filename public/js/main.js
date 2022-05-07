let respuesta = null
let cambioFecha = false
let cambioVisible = false

async function iniRepreData() {
    //tomo la versión y la represnto
    const { data: rta } = await axios('/version')
    console.log(rta)
    document.getElementById('version').innerText = rta.version + (rta.cache? (' - ' + rta.cache) : '')

    // --------- Listeners que NO necesitan pedir datos ---------
    window.addEventListener("resize", function() {
        console.log('resize')
        repre(respuesta)
    });
    
    /* document.querySelectorAll('#filtros input[type="number"').forEach( input => {
        input.addEventListener('input', () => {
            console.log('input')
            repre(respuesta)
        })
    }) */

    // ----------- Listeners que necesitan pedir datos -------------
    document.addEventListener("visibilitychange", function() {
        if (document.visibilityState === 'visible') {
          //console.log('visible', new Date().toLocaleString())
          cambioVisible  =true
        } 
        else {
            //console.log('NO visible', new Date().toLocaleString())
        }
    });
    
    document.querySelectorAll('#filtros input').forEach( input => {
        input.addEventListener('change', () => {
            //console.log('change')
            cambioFecha = true
        })
    })

    document.querySelectorAll('#filtros input[type="number"').forEach( input => {
        input.addEventListener('input', () => {
            //console.log('input')
            cambioFecha = true
        })
    })    

    //acción del botón de borrar
    document.getElementById('borrar').onclick = function () {
        document.getElementById('start-time').value = ''
        document.getElementById('end-time').value = ''
        document.getElementById('step-min').value = ''
        cambioFecha = true
    }
}


function repre(respuesta) {
    if(!respuesta) return 

    console.warn('REPRESENTANDO...')

    const datos = respuesta.datos
    //console.log(datos)


    const valorVentaActual = datos[datos.length - 1]?.dolar || '?'
    const tsvalorVentaActual = datos[datos.length - 1]?.timestamp || '?'

    //tomo el step de minutos
    //let stepMin = document.getElementById('step-min').value 
    let stepMin = datos[0]?.stepMin 

    /* let stepMin = document.getElementById('step-min').value

    if (datos.length >= 1000 && datos.length < 5000 && stepMin < 5) stepMin = 5
    if (datos.length >= 5000 && datos.length < 10000 && stepMin < 10) stepMin = 10
    if (datos.length >= 10000 && datos.length < 15000 && stepMin < 20) stepMin = 20
    if (datos.length >= 15000 && datos.length < 20000 && stepMin < 30) stepMin = 30
    if (datos.length >= 20000 && stepMin < 60) stepMin = 60 */

    document.getElementById('valor-venta').innerHTML =
        `$${valorVentaActual}<br><i>(${new Date(tsvalorVentaActual).toLocaleString()})</i>`

    const [startTime, startTimestamp] = getStartTimestamp()
    const [endTime, endTimestamp] = getEndTimestamp()
    
    document.getElementById('modo').innerHTML = startTimestamp && endTimestamp ?
        `Mostrando desde <span>${new Date(startTime).toLocaleString()}</span> hasta <span>${new Date(endTime).toLocaleString()}</span>` :
        `Mostrando <span>última hora</span>`

    document.getElementById('modo').innerHTML += ` en pasos de <span>${stepMin ? stepMin : 1} minuto(s)</span>`

    graf(datos)
}

function getStartTimestamp() {
    //tomo la hora del input y muestro el modo de operación
    const startTime = document.getElementById('start-time').value
    const startTimestamp = new Date(startTime).getTime() || 0

    return [startTime, startTimestamp]
}

function getEndTimestamp() {
    const endTime = document.getElementById('end-time').value
    const endTimestamp = new Date(endTime).getTime() || 0
    
    return [endTime, endTimestamp]
}

let minutesAnt = null
async function tickRepreData() {
    //represento la hora actual
    const timeNow = new Date()

    document.getElementById('fyh').innerText = timeNow.toLocaleString()

    const [, startTimestamp] = getStartTimestamp()
    const [, endTimestamp] = getEndTimestamp()
    const stepMin = document.getElementById('step-min').value || 0

    let minutes = timeNow.getMinutes()

    //petición de los datos al backend
    if (
        (!startTimestamp && !endTimestamp && (minutes != minutesAnt)) ||
        cambioFecha || cambioVisible
    ) {
        console.warn('Pidiendo...', new Date().toLocaleString(), {minutes, cambioFecha, cambioVisible})

        if(cambioFecha) cambioFecha = false
        if(cambioVisible) cambioVisible = false
        minutesAnt = minutes

        respuesta = null
        const { data: rta } = await axios(`/data/${startTimestamp}/${endTimestamp}/${stepMin}`)
        respuesta = rta

        repre(respuesta)
    }
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

const graf = datosin => {
    //console.log(datosin)

    if (datosin.length && (typeof datosin[0] != 'undefined')) {

        const datos = datosin//.filter((dato, index) => index % step == 0)
        //datos.push(datosin[datosin.length - 1])

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
            margin: {
                /* l: 50,
                r: 50,
                b: 125, */
                t: 125,
                /* pad: 4 */
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
                //console.log('El service worker se registró correctamente', reg)

                notificaciones.initialiseUI(reg)

                //Pedimos permiso al sistema operativo para permitir ventanas de notificación emergentes
                Notification.requestPermission(function (result) {
                    if (result === 'granted') {
                        navigator.serviceWorker.ready.then(function (registration) {
                            //console.log(registration)
                        });
                    }
                });

                //skip waiting automático
                reg.onupdatefound = () => {
                    const installingWorker = reg.installing
                    installingWorker.onstatechange = () => {
                        console.log('SW ---> ', installingWorker.state)
                        if (installingWorker.state == 'activated') {
                            console.error('reinicio en 2 segundos ...')
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
    chat.start()
}

window.onload = start