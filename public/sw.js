self.addEventListener('install', e => {
    console.log('sw install')

    //skip waiting automático
    self.skipWaiting()
})

self.addEventListener('activate', e => {
    console.log('sw activate')
})

self.addEventListener('fetch', e => {
    //console.log('sw fetch!!!')
})

self.addEventListener('push', e => {
    //console.log('push',e)

    let mensaje = e.data.text()
    console.log(mensaje)

    //https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
    const title = 'Dolar Blue'
    const options = {
        body: `Mensaje: ${mensaje}`,
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