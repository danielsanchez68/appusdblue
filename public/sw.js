const CACHE_NAME = 'c0.6.8'
const CON_CACHE = true

self.addEventListener('install', e => {
    console.log('sw install')

    //skip waiting automático
    self.skipWaiting()
})

self.addEventListener('activate', e => {
    console.log('sw activate')

    const cacheWhiteList = [
        CACHE_NAME
    ]

    //Borrar todos los caches que no esten en la lista actual (versión actual)
    e.waitUntil(
        caches.keys().then(keys =>  {
            //console.log(keys)
            return Promise.all(
                keys.map( key => {
                    //console.log(key)
                    if(!cacheWhiteList.includes(key)) {
                        return caches.delete(key)
                    }
                })
            )
        })//.then(self.clients.claim())
    )
})

self.addEventListener('fetch', e => {
    //console.log('sw fetch!!!')
    if(CON_CACHE) {

        let { url, method } = e.request //destructuring Object 

        const urlsBypass = [
            '/data',
            '/vapidkeys',
            '/suscripcion',
            '/desuscripcion',
            '/notification',
            '/suscriptores',
            '/ping',
            '/version',
            '/test',
            '/push'
        ]

        const bypass = urlsBypass.filter(urlbypass => url.includes(urlbypass)).length
        /* bypass? 
        console.error('BYPASS', method, url) :
        console.log(method, url) */

        if(method == 'GET' && !bypass) {
            const respuesta = caches.match(e.request).then( res => {
                if(res) {
                    //console.log('EXISTE: el recurso existe en el cache',url)
                    return res
                }
                //console.error('NO EXISTE: el recurso no existe en el cache',url)

                return fetch(e.request).then( nuevaRespuesta => {
                    caches.open(CACHE_NAME).then( cache => {
                        cache.put(e.request, nuevaRespuesta)
                    })
                    return nuevaRespuesta.clone()
                })
            })

            e.respondWith(respuesta)        
        }
        else {
            //console.warn('BYPASS', method, url)
            if(method == 'GET' && url.includes('/version')) {
                console.log('SW VERSIÓN')
                const respuesta = fetch(e.request).then(r => r.json()).then( rta => {
                    //console.log(rta)
                    const nuevaVersion = {version: rta.version, cache: CACHE_NAME}
                    //console.log(nuevaVersion)
                    return new Response(JSON.stringify(nuevaVersion),{'content-type':'application/json'})
                })
                e.respondWith(respuesta)   
            }
        }
    }
})

self.addEventListener('push', e => {
    //console.log('push',e)

    let mensaje = e.data.text()
    console.log(mensaje)

    //https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
    const title = 'Dolar Blue'
    const options = {
        body: `${mensaje}`,
        icon: 'images/icons/icon-72x72.png',
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        badge: 'https://w7.pngwing.com/pngs/90/177/png-transparent-computer-icons-united-states-dollar-dollar-sign-dollar-coin-dollar-trademark-logo-sign.png'
    }

    e.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', e => {
    console.log('Click en notificación push', e)

    e.notification.close()
    //e.waitUntil(clients.openWindow('https://www.instagram.com/'))
})