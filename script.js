// Variables globales para almacenar temporalmente el rol del usuario y el estado de administrador
let userRole = null;
let isAdmin = false;

document.addEventListener('DOMContentLoaded', function() {
    // Contenedor donde aparecerá el nombre del usuario o el botón de administrador
    const userInfoContainer = document.getElementById('user-info');

    // Obtener datos de usuario de los parámetros de la URL
    userRole = obtenerParametroURL('userRole');
    isAdmin = obtenerParametroURL('isAdmin') === 'true';

    // Función para actualizar el contenido del contenedor user-info
    function actualizarUserInfo() {
        // Limpiar el contenedor al iniciar
        userInfoContainer.innerHTML = '';

        // Si el usuario está logueado (userRole tiene un valor válido)
        if (userRole) {
            if (isAdmin) {
                // Crear y agregar el botón de administrador
                const adminButton = document.createElement('button');
                adminButton.textContent = 'Administrador';
                adminButton.classList.add('admin-button');
                adminButton.onclick = function() {
                    window.location.href = 'usersClubs.html'; // Redirigir a la página de administración
                };
                userInfoContainer.appendChild(adminButton);
            } else {
                // Crear y agregar un elemento span con el nombre del usuario
                const userNameSpan = document.createElement('span');
                userNameSpan.textContent = userRole;
                userInfoContainer.appendChild(userNameSpan);
            }
        }
    }

    // Llamar a la función para actualizar la información del usuario al cargar la página
    actualizarUserInfo();
});

// Función para el inicio de sesión del usuario
function loginUsuario() {
    const url = 'http://localhost:3000/usuarios';
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Crear la solicitud AJAX
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);  // Solicitud GET para obtener usuarios
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const usuarios = JSON.parse(xhr.responseText);
                
                // Buscar al usuario por nick/email y contraseña
                const usuario = usuarios.find(u => 
                    (u.nick_user === username || u.email === username) && u.password_user === password
                );

                if (usuario) {
                    // Asignar variables de sesión sin almacenar en localStorage
                    userRole = usuario.nick_user;
                    isAdmin = usuario.admin;

                    // Redirigir a la página de inicio con parámetros en la URL
                    window.location.href = `index.html?userRole=${encodeURIComponent(userRole)}&isAdmin=${isAdmin}`;
                } else {
                    alert("Datos incorrectos.");
                }
            } else {
                console.error("Error en la solicitud:", xhr.status, xhr.statusText);
                alert("Hubo un error en el proceso de autenticación.");
            }
        }
    };
    xhr.send();  // Enviar la solicitud
}

// Función para obtener parámetros de la URL
function obtenerParametroURL(nombre) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombre);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





// Mostrar la lista de usuarios
function mostrarUsuarios() {
    const url = 'http://localhost:3000/usuarios';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const usuarios = JSON.parse(xhr.responseText);
            crearListaUsuarios(usuarios);
            document.getElementById('users-section').style.display = 'block'; // Mostrar sección de usuarios
        } else if (xhr.readyState === 4) {
            console.error("Error al cargar los usuarios:", xhr.status, xhr.statusText);
        }
    };
    xhr.send();
    // Ocultar la sección de clubes
    document.getElementById('clubs-section').style.display = 'none';
    // Mostrar la sección de usuarios
    document.getElementById('users-section').style.display = 'block';
}

function crearListaUsuarios(usuarios) {
    // Limpiar listas existentes
    const listaNormales = document.getElementById('lista-usuarios-normales');
    const listaAdministradores = document.getElementById('lista-usuarios-administradores');
    listaNormales.innerHTML = '';
    listaAdministradores.innerHTML = '';

    // Filtrar usuarios normales (admin: false) y administradores (admin: true)
    const usuariosNormales = usuarios.filter(usuario => usuario.admin === false);
    const usuariosAdministradores = usuarios.filter(usuario => usuario.admin === true);

    // Función para crear un elemento de usuario con diseño simétrico
    function crearElementoUsuario(usuario, lista) {
        const listItem = document.createElement('li');
        listItem.classList.add('user-item'); // Clase para estilos

        // Contenedor para datos del usuario (nick e id)
        const userInfo = document.createElement('div');
        userInfo.classList.add('user-info');
        userInfo.textContent = `Nick: ${usuario.nick_user}, ID: ${usuario.id}`; 

        // Contenedor para los botones
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        // Botón de modificar
        const modifyButton = document.createElement('button');
        modifyButton.textContent = 'Modificar';
        modifyButton.classList.add('action-button');
        modifyButton.onclick = function () {
            mostrarFormulario(usuario); // Cargar datos en el formulario de modificación
        };

        // Botón de eliminar
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.classList.add('action-button');
        deleteButton.onclick = function () {
            const confirmacion = prompt('Para confirmar la eliminación, escribe "CONFIRMAR":');
            if (confirmacion === "CONFIRMAR") {
                borrarUsuario(usuario.id); // Eliminar usuario
            } else {
                alert("El usuario no se ha eliminado.");
            }
        };

        // Agregar los botones al contenedor
        buttonContainer.appendChild(modifyButton);
        buttonContainer.appendChild(deleteButton);

        // Añadir información del usuario y botones al item
        listItem.appendChild(userInfo);
        listItem.appendChild(buttonContainer);

        // Añadir el item a la lista correspondiente
        lista.appendChild(listItem);
    }

    // Crear elementos para usuarios normales y administradores
    usuariosNormales.forEach(usuario => crearElementoUsuario(usuario, listaNormales));
    usuariosAdministradores.forEach(usuario => crearElementoUsuario(usuario, listaAdministradores));
}

// Función para eliminar un usuario
function borrarUsuario(id) {
    const url = `http://localhost:3000/usuarios/${id}`;
    var xhr = new XMLHttpRequest();
    xhr.open('DELETE', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                alert("Usuario eliminado con éxito.");
                mostrarUsuarios(); // Actualizar la lista de usuarios
            } else {
                console.error("Error al eliminar el usuario:", xhr.status, xhr.statusText);
                alert("No se pudo eliminar el usuario. Intenta nuevamente.");
            }
        }
    };
    xhr.send();
}

// Variable global para almacenar el usuario que se está modificando
let usuarioSeleccionado = null;

// Mostrar el formulario de usuario para modificar un usuario existente
function mostrarFormulario(usuario = null) {
    usuarioSeleccionado = usuario; // Almacenar usuario que se está modificando o null si es un nuevo registro

    document.getElementById('buttons-container').style.display = 'none';
    document.getElementById('users-section').style.display = 'none';
    
    const form = document.getElementById('user-form');
    form.style.display = 'block';
    document.getElementById('form-title').textContent = usuario ? "Modificar Usuario" : "Registrar Usuario";

    // Llenar campos con los datos del usuario a modificar o dejarlos vacíos
    document.getElementById('nick_user').value = usuario ? usuario.nick_user : '';
    document.getElementById('name_user').value = usuario ? usuario.name_user : '';
    document.getElementById('email_user').value = usuario ? usuario.email : '';
    document.getElementById('address_user').value = usuario ? usuario.address : '';
    document.getElementById('dni_user').value = usuario && usuario.dni_user ? usuario.dni_user : '';
    document.getElementById('admin').checked = usuario ? usuario.admin : false;

    // Cambiar el botón "Guardar" para que llame a la función correcta según si es modificación o creación
    const submitButton = document.querySelector('#user-form .submit');
    submitButton.textContent = usuario ? "Modificar" : "Guardar";
    submitButton.onclick = usuario ? modificarUsuario : guardarUsuario;

    // Mostrar el botón de cancelar
    const cancelButton = document.querySelector('#user-form .cancel');
    cancelButton.style.display = 'inline-block';
    cancelButton.onclick = cerrarFormulario;
}

// Modificar un usuario existente
function modificarUsuario() {
    if (!usuarioSeleccionado) {
        alert("No se ha seleccionado ningún usuario para modificar.");
        return;
    }

    // Obtener los valores actuales del formulario
    const nick_user = document.getElementById('nick_user').value;
    const name_user = document.getElementById('name_user').value;
    const email_user = document.getElementById('email_user').value;
    const address_user = document.getElementById('address_user').value;
    const dni_user = document.getElementById('dni_user').value;
    const isAdmin = document.getElementById('admin').checked;

    // Crear un objeto con los campos modificados
    const camposModificados = {};
    if (nick_user !== usuarioSeleccionado.nick_user) camposModificados.nick_user = nick_user;
    if (name_user !== usuarioSeleccionado.name_user) camposModificados.name_user = name_user;
    if (email_user !== usuarioSeleccionado.email) camposModificados.email = email_user;
    if (address_user !== usuarioSeleccionado.address) camposModificados.address = address_user;
    if (dni_user !== usuarioSeleccionado.dni) camposModificados.dni = dni_user;
    if (isAdmin !== usuarioSeleccionado.admin) camposModificados.admin = isAdmin;

    // Verificar si hay cambios
    if (Object.keys(camposModificados).length === 0) {
        alert("No se han realizado cambios.");
        return;
    }

    // Enviar una solicitud PATCH con los cambios
    const url = `http://localhost:3000/usuarios/${usuarioSeleccionado.id}`;
    const xhr = new XMLHttpRequest();
    xhr.open('PATCH', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                alert("Usuario modificado con éxito.");
                cerrarFormulario(); // Cerrar el formulario
                mostrarUsuarios(); // Actualizar la lista de usuarios
            } else {
                console.error("Error al modificar el usuario:", xhr.status, xhr.statusText);
                alert("Hubo un error al modificar el usuario. Inténtalo de nuevo.");
            }
        }
    };
    xhr.send(JSON.stringify(camposModificados));
}

// Cerrar el formulario sin guardar
function cerrarFormulario() {
    // Ocultar el formulario
    const form = document.getElementById('user-form');
    form.style.display = 'none';

    // Volver a mostrar las secciones de lista de usuarios y botones
    document.getElementById('buttons-container').style.display = 'block';
    document.getElementById('users-section').style.display = 'block';
}


// Guardar el usuario en el servidor
function guardarUsuario() {
    // Obtener los valores de los campos
    const nick_user = document.getElementById('nick_user').value;
    const name_user = document.getElementById('name_user').value;
    const password_user = document.getElementById('password_user').value;
    const email_user = document.getElementById('email_user').value;
    const address_user = document.getElementById('address_user').value;
    const dni_user = document.getElementById('dni_user').value;

    // Validar que todos los campos sean obligatorios
    if (!nick_user || !name_user || !password_user || !email_user || !address_user || !dni_user) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    // Validar que el nick, email y DNI no estén ya en la base de datos
    const url = 'http://localhost:3000/usuarios';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const usuarios = JSON.parse(xhr.responseText);

            // Verificar si el nick, email o DNI ya existen
            const nickExiste = usuarios.some(usuario => usuario.nick_user === nick_user);
            const emailExiste = usuarios.some(usuario => usuario.email === email_user);
            const dniExiste = usuarios.some(usuario => usuario.dni === dni_user);

            let mensajeError = "";
            if (nickExiste) mensajeError += "El nick ya existe. ";
            if (emailExiste) mensajeError += "El correo ya existe. ";
            if (dniExiste) mensajeError += "El DNI ya existe. ";

            if (mensajeError) {
                alert(mensajeError); // Mostrar mensaje si hay duplicados
                return;
            }

            // Si no hay duplicados, continuar con la creación del usuario
            const isAdmin = document.getElementById('admin').checked;
            const userData = {
                nick_user,
                name_user,
                password_user,
                email_user,
                address_user,
                dni_user,
                admin: isAdmin
            };

            var xhrPost = new XMLHttpRequest();
            xhrPost.open('POST', url, true);
            xhrPost.setRequestHeader('Content-Type', 'application/json');
            xhrPost.onreadystatechange = function() {
                if (xhrPost.readyState === 4 && xhrPost.status === 201) {
                    alert("Usuario guardado con éxito.");
                    cerrarFormulario(); // Cerrar el formulario al guardar
                    mostrarUsuarios(); // Actualizar la lista de usuarios
                } else if (xhrPost.readyState === 4) {
                    alert("Error al guardar el usuario.");
                }
            };
            xhrPost.send(JSON.stringify(userData));
        } else if (xhr.readyState === 4) {
            console.error("Error al verificar la existencia del usuario:", xhr.status, xhr.statusText);
            alert("Hubo un problema al verificar los datos. Inténtalo de nuevo.");
        }
    };
    xhr.send();
}

// Mostrar la lista de clubs
function mostrarClubes() {
    const url = 'http://localhost:3000/clubs'; // Asegúrate de tener un servidor que sirva los datos en esta ruta
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const clubs = JSON.parse(xhr.responseText);
            crearListaClubes(clubs);
            document.getElementById('clubs-section').style.display = 'block'; // Mostrar sección de clubs
        } else if (xhr.readyState === 4) {
            console.error("Error al cargar los clubs:", xhr.status, xhr.statusText);
        }
    };
    xhr.send();

     // Ocultar la sección de usuarios
     document.getElementById('users-section').style.display = 'none';
     // Mostrar la sección de clubes
     document.getElementById('clubs-section').style.display = 'block';
}

// Función para crear la lista de clubes
function crearListaClubes(clubs) {
    // Limpiar lista existente
    const listaClubes = document.getElementById('lista-clubes');
    listaClubes.innerHTML = '';

    // Función para crear un elemento de club con diseño simétrico
    function crearElementoClub(club) {
        const listItem = document.createElement('li');
        listItem.classList.add('club-item'); // Clase para los estilos de club

        // Contenedor para datos del club (nombre e id)
        const clubInfo = document.createElement('div');
        clubInfo.classList.add('club-info');
        clubInfo.textContent = `Nombre: ${club.name_club}, ID: ${club.id_club}`;

        // Contenedor para los botones
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        // Botón de modificar
        const modifyButton = document.createElement('button');
        modifyButton.textContent = 'Modificar';
        modifyButton.classList.add('action-button');
        modifyButton.onclick = function () {
            mostrarFormularioModificarClub(club); // Cargar datos en el formulario de modificación
        };

        // Botón de eliminar
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.classList.add('action-button');
        deleteButton.onclick = function () {
            const confirmacion = prompt('Para confirmar la eliminación, escribe "CONFIRMAR":');
            if (confirmacion === "CONFIRMAR") {
                eliminarClub(club.id_club); // Eliminar club
            } else {
                alert("El club no se ha eliminado.");
            }
        };

        // Agregar los botones al contenedor
        buttonContainer.appendChild(modifyButton);
        buttonContainer.appendChild(deleteButton);

        // Añadir información del club y los botones al item
        listItem.appendChild(clubInfo);
        listItem.appendChild(buttonContainer);

        // Añadir el item a la lista de clubs
        listaClubes.appendChild(listItem);
    }

    // Crear elementos para cada club
    clubs.forEach(club => crearElementoClub(club));
}

// Función para modificar los datos de un club
function mostrarFormularioModificarClub(club) {
    // Mostrar un formulario de modificación (aquí puedes agregar un formulario modal)
    const nuevoNombre = prompt("Ingrese el nuevo nombre del club:", club.name_club);
    if (nuevoNombre && nuevoNombre !== club.name_club) {
        modificarClub(club.id_club, nuevoNombre);
    }
}

// Función para modificar un club
function modificarClub(idClub, nuevoNombre) {
    const url = `http://localhost:3000/clubs/${idClub}`; // Asume que tienes un endpoint para actualizar un club
    var xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            alert('Club modificado exitosamente.');
            mostrarClubes(); // Actualizar la lista de clubes
        } else if (xhr.readyState === 4) {
            console.error("Error al modificar el club:", xhr.status, xhr.statusText);
        }
    };
    const clubData = JSON.stringify({
        name_club: nuevoNombre
    });
    xhr.send(clubData);
}

// Función para eliminar un club
function eliminarClub(idClub) {
    const url = `http://localhost:3000/clubs/${idClub}`;
    var xhr = new XMLHttpRequest();
    xhr.open('DELETE', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            alert('Club eliminado exitosamente.');
            mostrarClubes(); // Actualizar la lista de clubes
        } else if (xhr.readyState === 4) {
            console.error("Error al eliminar el club:", xhr.status, xhr.statusText);
        }
    };
    xhr.send();
}
