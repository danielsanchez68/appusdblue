async function iniRepreData() {
    //tomo la versión y la represnto
    const { data:rta} = await axios('/version')
    document.getElementById('version').innerText = rta.version

    //acción del botón de borrar
    document.getElementById('borrar').onclick = function() {
        document.getElementById('start-time').value = ''
    }
}

async function tickRepreData() {
    //tomo la hora del input y muestro el modo de operación
    const startTime = document.getElementById('start-time').value
    const startTimestamp = new Date(startTime).getTime()

    //tomo la cantidad de minutos
    const cantMin = document.getElementById('cant-min').value
    //tomo el step de minutos
    const stepMin = document.getElementById('step-min').value

    document.getElementById('modo').innerText = 
        `Mostrando ${cantMin? cantMin:60} minuto(s) en pasos de ${stepMin?stepMin: 1} minuto(s) ${startTimestamp? 'a partir de la fecha inicial': 'anteriores a la fecha actual'}`


    //petición de los datos al backend
    const { data: respuesta } = await axios(`/data/${cantMin && cantMin!=0?cantMin:60}/${startTimestamp}`)

    const datos = respuesta.ultimos
    const valorVentaActual = datos[datos.length-1]?.dolar || '?'
    const tsvalorVentaActual = datos[datos.length-1]?.timestamp || '?'
    document.getElementById('valor-venta').innerHTML = 
        `$${valorVentaActual } <i>(${new Date(tsvalorVentaActual).toLocaleString()})</i>`

    graf(datos, stepMin && stepMin!=0? stepMin : 1) 

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

const graf = (datosin,step) => {

    const datos = datosin.filter((dato,index) => index % step == 0)

    if(datos.length) { 
        document.getElementById('msg-error').innerHTML = ''
        document.getElementById('myDiv').style.display = 'block'
    }
    else {
        document.getElementById('myDiv').style.display = 'none'
        document.getElementById('msg-error').innerHTML = '<h2>No se encontraron datos</h2>'
    }



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


function registrarServiceWorker() {
    if('serviceWorker' in navigator) {
        this.navigator.serviceWorker.register('./sw.js')
        .then( reg => {
            console.log('El service worker se registró correctamente', reg)
        })
        .catch( err => {
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