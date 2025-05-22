document.addEventListener("DOMContentLoaded", function() {
    // Configuración del menú lateral
    const cloud = document.getElementById("cloud");
    const barraLateral = document.querySelector(".barra-lateral");
    const spans = document.querySelectorAll("span");
    const menu = document.querySelector(".menu");
    const main = document.querySelector("main");

    // Verificar si el menú existe
    if (menu) {
        menu.addEventListener("click", () => {
            barraLateral.classList.toggle("max-barra-lateral");
            if (barraLateral.classList.contains("max-barra-lateral")) {
                menu.children[0].style.display = "none";
                menu.children[1].style.display = "block";
            } else {
                menu.children[0].style.display = "block";
                menu.children[1].style.display = "none";
            }
            if (window.innerWidth <= 320) {
                barraLateral.classList.add("mini-barra-lateral");
                main.classList.add("min-main");
                spans.forEach((span) => {
                    span.classList.add("oculto");
                });
            }
        });
    }

    // Cargar usuarios
    cargarUsuarios();

    // Buscar usuarios
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Delegación de eventos para botones de acción
    document.addEventListener('click', function(event) {
        // Ver usuario
        if (event.target.classList.contains('ver-usuario') || 
            event.target.parentElement.classList.contains('ver-usuario')) {
            const button = event.target.classList.contains('ver-usuario') ? 
                          event.target : 
                          event.target.parentElement;
            const userId = button.getAttribute('data-id');
            verUsuario(userId);
        }
        
        // Editar usuario
        if (event.target.classList.contains('editar-usuario') || 
            event.target.parentElement.classList.contains('editar-usuario')) {
            const button = event.target.classList.contains('editar-usuario') ? 
                          event.target : 
                          event.target.parentElement;
            const userId = button.getAttribute('data-id');
            editarUsuario(userId);
        }
        
        // Paginación
        if (event.target.classList.contains('pagination-button')) {
            const buttons = document.querySelectorAll('.pagination-button');
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            // Aquí implementarías la lógica de paginación
        }
    });

    // Manejar el clic en el botón "Guardar" para guardar los cambios del usuario
    document.getElementById('guardarUsuario').addEventListener('click', function() {
        var idUsuario = document.getElementById('idUsuarioEditar').value;
        var nombre = document.getElementById('nombreUsuario').value;
        var apellidos = document.getElementById('apellidosUsuario').value;
        var correo = document.getElementById('correoUsuario').value;
        var rol = document.getElementById('rolUsuario').value;
        var estado = document.getElementById('estadoUsuario').value;

        // Realizar la solicitud para actualizar el usuario
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "../Controlador/cusuarios.php", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // Recargar la tabla de usuarios después de actualizar
                cargarUsuarios();
                // Cerrar el modal de edición
                var modal = bootstrap.Modal.getInstance(document.getElementById('editarUsuarioModal'));
                modal.hide();
            }
        };
        xhr.send(`id_usuario=${idUsuario}&nombre=${nombre}&apellidos=${apellidos}&correo=${correo}&rol=${rol}&estado=${estado}`);
    });

    function cargarUsuarios() {
        // Mostrar indicador de carga
        mostrarCargando();
        
        // Realizar petición AJAX para cargar usuarios
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "../Controlador/cusuarios.php", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                // Ocultar indicador de carga
                ocultarCargando();
                
                if (xhr.status === 200) {
                    document.getElementById("tabla-usuarios").innerHTML = xhr.responseText;
                    
                    // Aplicar estilos a los elementos dinámicos
                    aplicarEstilos();
                } else {
                    console.error("Error al cargar usuarios");
                }
            }
        };
        xhr.send();
    }

    function aplicarEstilos() {
        // Aplicar estilos a los roles
        document.querySelectorAll('td:nth-child(5)').forEach(cell => {
            const rol = cell.textContent.trim();
            cell.innerHTML = `<span class="rol-badge ${rol.toLowerCase() === 'administrador' ? 'rol-admin' : 'rol-estudiante'}">${rol}</span>`;
        });
        
        // Aplicar estilos a los estados
        document.querySelectorAll('td:nth-child(6)').forEach(cell => {
            const estado = cell.textContent.trim();
            cell.innerHTML = `<span class="estado-badge ${estado.toLowerCase() === 'activo' ? 'estado-activo' : 'estado-inactivo'}">${estado}</span>`;
        });
        
        // Aplicar estilos a los correos
        document.querySelectorAll('td:nth-child(4)').forEach(cell => {
            const email = cell.textContent.trim();
            cell.className = 'email-cell';
            cell.setAttribute('data-email', email);
        });
        
        // Aplicar estilos a los botones de acción
        document.querySelectorAll('td:nth-child(7)').forEach(cell => {
            const buttons = cell.querySelectorAll('button, a');
            let id;
            
            // Intentar obtener el ID del usuario de diferentes atributos
            if (buttons.length > 0) {
                id = buttons[0].getAttribute('data-id-usuario') || 
                     buttons[0].getAttribute('data-id') || 
                     buttons[0].getAttribute('onclick')?.match(/\d+/) || '';
                
                if (typeof id === 'object' && id !== null) {
                    id = id[0];
                }
            }
            
            if (id) {
                cell.innerHTML = `
                    <div class="action-buttons">
                        <button class="btn-action btn-ver ver-usuario" data-id="${id}"><i class='bx bx-show'></i>Ver</button>
                        <button class="btn-action btn-editar editar-usuario" data-id="${id}"><i class='bx bx-edit'></i>Editar</button>
                    </div>
                `;
            }
        });
    }

    function verUsuario(id) {
        // Mostrar indicador de carga
        mostrarCargando();
        
        // Realizar petición AJAX para obtener los detalles del usuario
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `../Controlador/cusuarios.php?id_usuario=${id}`, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                // Ocultar indicador de carga
                ocultarCargando();
                
                if (xhr.status === 200) {
                    try {
                        // Obtener los detalles del usuario desde la respuesta JSON
                        var detallesUsuario = JSON.parse(xhr.responseText);
                        
                        // Construir el contenido del modal
                        var modalBody = `
                            <div class="user-details">
                                <div class="user-avatar">
                                    <i class='bx bx-user-circle' style="font-size: 80px; color: #a58e8e;"></i>
                                </div>
                                <div class="user-info">
                                    <p><strong>ID:</strong> ${detallesUsuario.id}</p>
                                    <p><strong>Nombre:</strong> ${detallesUsuario.nombre}</p>
                                    <p><strong>Apellidos:</strong> ${detallesUsuario.apellidos}</p>
                                    <p><strong>Correo:</strong> ${detallesUsuario.correo}</p>
                                    <p><strong>Rol:</strong> <span class="rol-badge ${detallesUsuario.rol.toLowerCase() === 'administrador' ? 'rol-admin' : 'rol-estudiante'}">${detallesUsuario.rol}</span></p>
                                    <p><strong>Estado:</strong> <span class="estado-badge ${detallesUsuario.estado.toLowerCase() === 'activo' ? 'estado-activo' : 'estado-inactivo'}">${detallesUsuario.estado}</span></p>
                                    <p><strong>Fecha de registro:</strong> ${detallesUsuario.fecha_registro || 'No disponible'}</p>
                                </div>
                            </div>
                        `;
                        document.getElementById("modalBody").innerHTML = modalBody;
                        
                        // Mostrar el modal
                        var modal = new bootstrap.Modal(document.getElementById('usuarioModal'), {
                            keyboard: false
                        });
                        modal.show();
                    } catch (e) {
                        console.error("Error al parsear los detalles del usuario:", e);
                    }
                } else {
                    console.error("Error al obtener los detalles del usuario");
                }
            }
        };
        xhr.send();
    }

    function editarUsuario(id) {
        // Mostrar indicador de carga
        mostrarCargando();
        
        // Realizar petición AJAX para obtener los datos del usuario
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `../Controlador/cusuarios.php?id_usuario=${id}`, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                // Ocultar indicador de carga
                ocultarCargando();
                
                if (xhr.status === 200) {
                    try {
                        // Obtener los datos del usuario desde la respuesta JSON
                        var datosUsuario = JSON.parse(xhr.responseText);
                        
                        // Cargar los datos en el formulario
                        document.getElementById('idUsuarioEditar').value = datosUsuario.id;
                        document.getElementById('nombreUsuario').value = datosUsuario.nombre;
                        document.getElementById('apellidosUsuario').value = datosUsuario.apellidos;
                        document.getElementById('correoUsuario').value = datosUsuario.correo;
                        
                        // Seleccionar el rol actual
                        var selectRol = document.getElementById('rolUsuario');
                        for (var i = 0; i < selectRol.options.length; i++) {
                            if (selectRol.options[i].value === datosUsuario.rol) {
                                selectRol.options[i].selected = true;
                                break;
                            }
                        }
                        
                        // Seleccionar el estado actual
                        var selectEstado = document.getElementById('estadoUsuario');
                        for (var i = 0; i < selectEstado.options.length; i++) {
                            if (selectEstado.options[i].value === datosUsuario.estado) {
                                selectEstado.options[i].selected = true;
                                break;
                            }
                        }
                        
                        // Mostrar el modal para editar el usuario
                        var modal = new bootstrap.Modal(document.getElementById('editarUsuarioModal'), {
                            keyboard: false
                        });
                        modal.show();
                    } catch (e) {
                        console.error("Error al parsear los datos del usuario:", e);
                    }
                } else {
                    console.error("Error al obtener los datos del usuario");
                }
            }
        };
        xhr.send();
    }

    function mostrarCargando() {
        // Verificar si ya existe un overlay de carga
        if (!document.querySelector('.loading-overlay')) {
            const loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
            document.querySelector('.table-responsive').appendChild(loadingOverlay);
        }
    }

    function ocultarCargando() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }
});