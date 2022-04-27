const notificaciones = (function() {

    let applicationServerPublicKey = ''
    let pushButton = null;
    let emailSuscriptor = null;
    let isSubscribed = false;
    let swRegistration = null;
    const regExpEmail = /^[a-zA-Z0-9_.]+@\w+\.[a-zA-Z0-9_.]+$/

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
            //pushButton.textContent = 'Deshabilitar notificaciones';
            pushButton.src = 'images/boton-on.png';
            pushButton.style.opacity = 1;
            emailSuscriptor.value = ''
            emailSuscriptor.setAttribute('disabled', '')
            emailSuscriptor.style.opacity = 0.5;
            emailSuscriptor.style.boxShadow = `2px 2px 2px rgba(0,128,0,0.5)`
            emailSuscriptor.style.border = `1px solid rgba(0,128,0,0.5)`
        } else {
            //console.log('updateBtn', emailSuscriptor.value? '1':'0')
            pushButton.style.opacity = regExpEmail.test(emailSuscriptor.value)? 1: 0.5
            //pushButton.textContent = 'Habilitar notificaciones';
            pushButton.src = 'images/boton-off.png';
            emailSuscriptor.removeAttribute('disabled')
            emailSuscriptor.style.opacity = 1;
            emailSuscriptor.style.boxShadow = `2px 2px 2px rgba(128,0,0,0.5)`
            emailSuscriptor.style.border = `1px solid rgba(128,0,0,0.5)`
        }
    
        //pushButton.disabled = false;
    }
    
    //---------------------------------------------------------------
    // function updateSubscriptionOnServer(subscription)
    //---------------------------------------------------------------
    function updateSubscriptionOnServer(subscription, suscribir) {
        if (suscribir) {
            postSuscripcion(subscription, data => {
                console.log(data)
            })
        }
        else {
            postDesuscripcion(subscription, data => {
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
                    console.log(subscription)
                    console.log('User is subscribed:', subscription);
        
                    updateSubscriptionOnServer(subscription, true);
        
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
                    subscription.unsubscribe();
                    return subscription
                }
            })
            .catch(function (error) {
                console.log('Error unsubscribing', error);
            })
            .then(function (subscription) {
                console.log('unsubscribeUser', subscription)

                updateSubscriptionOnServer(subscription, false);
    
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
    }
    
    //---------------------------------------------------------------
    // function postSuscripcion(datos, cb)
    //---------------------------------------------------------------
    async function postSuscripcion(datos, cb) {
        try {
            //console.error(datos)
            const { data: rta } = await axios.post('/suscripcion', {datos:datos, emailSuscriptor: emailSuscriptor.value})
            cb(rta)
        }
        catch(error) {
            console.log(error)
            cb('error')
        }
    }
    
    //---------------------------------------------------------------
    // function postDesuscripcion(datos, cb)
    //---------------------------------------------------------------
    async function postDesuscripcion(datos, cb) {
        try {
            const { data: rta } = await axios.post('/desuscripcion', datos)
            cb(rta)
        }
        catch(error) {
            console.log(error)
            cb('error')
        }
    }

    //---------------------------------------------------------------
    // function initialiseUI(reg)
    //---------------------------------------------------------------
    function initialiseUI(reg) {

        pushButton = document.querySelector('.js-push-btn');
        
        emailSuscriptor = document.querySelector('#email-suscriptor')

        isSubscribed = false;
        swRegistration = reg;
        
        pushButton.addEventListener('click', function () {
            //pushButton.disabled = true;
            pushButton.style.opacity = 0.5;
            if (isSubscribed) {
                unsubscribeUser();
            } else {
                if(regExpEmail.test(emailSuscriptor.value)) {
                    subscribeUser();
                }
                else alert('Debe ingresar un email válido de suscripción')
            }
        });

        emailSuscriptor.addEventListener('input', function () {
            const ok = regExpEmail.test(emailSuscriptor.value)
            pushButton.style.opacity = ok? 1 : 0.5;
            emailSuscriptor.style.boxShadow = `2px 2px 2px ${ok?'rgba(0,128,0,0.5':'rgba(128,0,0,0.5'})`
            emailSuscriptor.style.border = `1px solid ${ok?'rgba(0,128,0,0.5':'rgba(128,0,0,0.5'}`
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
