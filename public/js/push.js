const notificaciones = (function() {

    let applicationServerPublicKey = ''
    let pushButton = null;
    let isSubscribed = false;
    let swRegistration = null;
    
    //---------------------------------------------------------------
    // function urlB64ToUint8Array(base64String)
    //---------------------------------------------------------------
    function urlB64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
    
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
    
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        //console.log(outputArray)
        return outputArray;
    }
    
    //---------------------------------------------------------------
    // function updateBtn()
    //---------------------------------------------------------------
    function updateBtn() {
        if (isSubscribed) {
            pushButton.textContent = 'Deshabilitar notificaciones';
        } else {
            pushButton.textContent = 'Habilitar notificaciones';
        }
    
        pushButton.disabled = false;
    }
    
    //---------------------------------------------------------------
    // function updateSubscriptionOnServer(subscription)
    //---------------------------------------------------------------
    function updateSubscriptionOnServer(subscription) {
        // TODO: Send subscription to application server
        if (subscription) {
            postSuscripcion(subscription, data => {
                console.log(data)
            })
        }
    }
    
    //---------------------------------------------------------------
    // function subscribeUser()
    //---------------------------------------------------------------
    function subscribeUser() {
    
        getVapidKeys(vapidkeys => {
            //console.log(vapidkeys)
    
            if(vapidkeys != 'error') {
                applicationServerPublicKey = vapidkeys.data.publicKey
                console.log(applicationServerPublicKey)
    
                const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
                swRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey
                })
                .then(function (subscription) {
                    console.log('User is subscribed:', subscription);
        
                    updateSubscriptionOnServer(subscription);
        
                    isSubscribed = true;
        
                    updateBtn();
                })
                .catch(function (err) {
                    console.log('Failed to subscribe the user: ', err);
                    updateBtn();
                });
            }
            else {
                console.log('Error get vapid Keys')            
            }
        })
    }
    
    //---------------------------------------------------------------
    // function unsubscribeUser()
    //---------------------------------------------------------------
    function unsubscribeUser() {
        swRegistration.pushManager.getSubscription()
            .then(function (subscription) {
                if (subscription) {
                    return subscription.unsubscribe();
                }
            })
            .catch(function (error) {
                console.log('Error unsubscribing', error);
            })
            .then(function () {
                updateSubscriptionOnServer(null);
    
                console.log('User is unsubscribed.');
                isSubscribed = false;
    
                updateBtn();
            });
    }
    
    //---------------------------------------------------------------
    // function getVapidKeys(cb)
    //---------------------------------------------------------------
    async function getVapidKeys(cb) {
        try {
            const { data: rta } = await axios('/vapidkeys')
            cb(rta)
        }
        catch(error) {
            console.log(error)
            cb('error')
        }
        /*
        $.ajax({
            url: url,
            method: 'get'
        })
        .then(cb)
        .catch(error => {
            console.log(error)
            cb('error')
        })
        */
    }
    
    //---------------------------------------------------------------
    // function postSuscripcion(datos, cb)
    //---------------------------------------------------------------
    async function postSuscripcion(datos, cb) {
        let url = 'http://localhost:8080/suscripcion'
    
        try {
            const { data: rta } = await axios.post('/suscripcion', datos)
            cb(rta)
        }
        catch(error) {
            console.log(error)
            cb('error')
        }
        /*
        $.ajax({
            url: url,
            data: JSON.stringify(datos),
            contentType: 'application/json',
            method: 'post'
        })
        .then(cb)
        .catch(error => {
            console.log(error)
            cb('error')
        })
        */
    }
    
    //---------------------------------------------------------------
    // function initialiseUI(reg)
    //---------------------------------------------------------------
    function initialiseUI(reg) {
    
        pushButton = document.querySelector('.js-push-btn');
        isSubscribed = false;
        swRegistration = reg;
    
        pushButton.addEventListener('click', function () {
            pushButton.disabled = true;
            if (isSubscribed) {
                unsubscribeUser();
            } else {
                subscribeUser();
            }
        });
    
        // Set the initial subscription value
        swRegistration.pushManager.getSubscription()
            .then(function (subscription) {
                isSubscribed = !(subscription === null);
    
                if (isSubscribed) {
                    console.log('User IS subscribed.');
                } else {
                    console.log('User is NOT subscribed.');
                }
                
                updateBtn();
            });
    }

    return {
        initialiseUI        
    }

})()
