const chat = (function() {

    const usuario =  document.querySelector('#chat #usuario')
    const texto =  document.querySelector('#chat #texto')
    const inputs = document.querySelectorAll('#chat input')    
    const button = document.querySelector('#chat button')
    const form = document.querySelector('#chat form')
    const divMensajes = document.querySelector('#chat #mensajes')

    function render(mensajes) {
        console.log(mensajes)
        //console.log(mensajes[0].timestamp)
        let html = mensajes.map( mensaje => `
            <div>
                <div>
                    <b>${mensaje.usuario}</b> at <b style="color:green;">${new Date(mensaje.timestamp).toLocaleString()}</b></div>
                <i>${mensaje.texto}</i>
            </div>
            <br>
        `).join('')

        //console.log(html)
        divMensajes.innerHTML = html
    }

    function start() {
        console.log('Cliente Websocket')

        const usuarioChat = localStorage.getItem('usuarioChat')
        if(usuarioChat) usuario.value = usuarioChat

        const socket = io.connect()
        socket.on('messages', mensajes => {
            //console.log(mensajes)
            render(mensajes)
        })

        const inputUsuario = inputs[0]
        const inputTexto = inputs[1]

        inputs.forEach( input => {
            input.addEventListener('input', () => {
                button.disabled = !inputUsuario.value || !inputTexto.value
            })
        })

        form.addEventListener('submit', e => {
            e.preventDefault()

            const usuarioChat = localStorage.getItem('usuarioChat')

            if(!usuario.value && usuarioChat) usuario.value = usuarioChat
            else if(usuario.value && usuarioChat && (usuario.value != usuarioChat)) {
                localStorage.setItem('usuarioChat', usuario.value)
            }
            else if(!usuarioChat && usuario.value) {
                localStorage.setItem('usuarioChat', usuario.value)
            }

            if(usuario.value && texto.value) {
                let mensaje = {
                    usuario: usuario.value,
                    texto: texto.value
                }
                texto.value = ''
                texto.focus()
                button.disabled = true
        
                socket.emit('new-message', mensaje)
            }
        })
    }

    return {
        start        
    }
})()

