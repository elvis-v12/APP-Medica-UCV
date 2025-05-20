document.addEventListener("DOMContentLoaded", function() {
    // Cargar las emergencias cuando se cargue la página
    cargarEmergencias();

    // Manejar el clic en los botones "Ver", "Cancelar" y "Editar"
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('ver-alerta')) {
            var idAlerta = event.target.getAttribute('data-id-alerta');
            cargarDetalleAlerta(idAlerta);
        } else if (event.target.classList.contains('cancelar-alerta')) {
            var idAlerta = event.target.getAttribute('data-id-alerta');
            mostrarModalConfirmacion(idAlerta);
        } else if (event.target.classList.contains('editar-alerta')) {
            var idAlerta = event.target.getAttribute('data-id-alerta');
            // Implementar función para editar alerta
            // Por ejemplo, redirigir a una página de edición
            alert('Implementar función para editar alerta con ID: ' + idAlerta);
        }
    });

    function cargarEmergencias() {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "../Controlador/r-emergencia.php", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                document.getElementById("tabla-emergencias").innerHTML = xhr.responseText;
            }
        };
        xhr.send();
    }

    function cargarDetalleAlerta(idAlerta) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "../Controlador/r-emergencia.php?id_alerta=" + idAlerta, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // Obtener los detalles de la alerta desde la respuesta JSON
                var detallesAlerta = JSON.parse(xhr.responseText);

                // Formatear la fecha
                var fecha = new Date(detallesAlerta.fecha);
                var opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var fechaFormateada = fecha.toLocaleDateString('es-PE', opcionesFecha);
                var horaFormateada = fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
                
                // Aplicar ucfirst solo al primer carácter del día
                fechaFormateada = fechaFormateada.replace(/^\w/, function(match) {
                    return match.toUpperCase();
                });
                
                // Obtener el color del estado
                var estadoColor = getEstadoColor(detallesAlerta.estado);

                // Mostrar los detalles en el modal
                document.getElementById('modalBody').innerHTML = `
                    <p><strong>ID de la Alerta:</strong> ${detallesAlerta.id_alerta}</p>
                    <p><strong>Ubicación:</strong> ${detallesAlerta.ubicacion}</p>
                    ${detallesAlerta.piso ? `<p><strong>Piso:</strong> ${detallesAlerta.piso}</p>` : ''}
                    <p><strong>Especificación:</strong> ${detallesAlerta.especificacion}</p>
                    <p><strong>Descripción:</strong> ${detallesAlerta.descripcion}</p>
                    <p><strong>Síntomas:</strong> ${detallesAlerta.sintomas}</p>
                    ${detallesAlerta.notas ? `<p><strong>Notas:</strong> ${detallesAlerta.notas}</p>` : ''}
                    <p><strong>Fecha:</strong> ${fechaFormateada} | ${horaFormateada}</p>
                    <p><strong>Estado:</strong> <button class="btn ${estadoColor}" disabled>${detallesAlerta.estado}</button></p>
                    ${detallesAlerta.estado === 'Pendiente' || detallesAlerta.estado === 'En proceso' ? `
                        <button class="btn btn-danger cancelar-alerta" data-id-alerta="${detallesAlerta.id_alerta}">Cancelar</button>
                        <button class="btn btn-primary editar-alerta" data-id-alerta="${detallesAlerta.id_alerta}">Editar</button>
                    ` : ''}
                `;

                // Mostrar el modal
                document.getElementById('alertaModal').classList.add('show');
                document.body.classList.add('modal-open');
            }
        };
        xhr.send();
    }

    function mostrarModalConfirmacion(idAlerta) {
        var confirmacionModal = new bootstrap.Modal(document.getElementById('confirmacionModal'));
        confirmacionModal.show();

        document.getElementById('confirmarCancelacion').onclick = function() {
            cancelarAlerta(idAlerta);
            confirmacionModal.hide();
        };
    }

    function cancelarAlerta(idAlerta) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "../Controlador/r-emergencia.php", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // Parsear la respuesta JSON
                var respuesta = JSON.parse(xhr.responseText);
    
                // Actualizar el contenido del modal con el mensaje de respuesta
                document.getElementById('mensajeModalTexto').textContent = respuesta.message;
    
                // Mostrar el modal
                var mensajeModal = new bootstrap.Modal(document.getElementById('mensajeModal'));
                mensajeModal.show();
    
                // Recargar las emergencias si la cancelación fue exitosa
                if (respuesta.success) {
                    cargarEmergencias();
                }
            }
        };
        xhr.send("id_alerta=" + idAlerta + "&action=cancelar");
    }
    
    document.getElementById('mensajeModal').addEventListener('hidden.bs.modal', function (event) {
        cargarEmergencias();
    });
    
    function getEstadoColor(estado) {
        switch (estado) {
            case 'Pendiente':
                return 'btn-danger btn-sm';
            case 'En proceso':
                return 'btn-warning btn-sm';
            case 'Atendido':
                return 'btn-success btn-sm';
            case 'Cancelado':
                return 'btn-secondary btn-sm';
            default:
                return 'btn-secondary btn-sm';
        }
    }
});
