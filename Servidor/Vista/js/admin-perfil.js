const cloud = document.getElementById("cloud");
const barraLateral = document.querySelector(".barra-lateral");
const spans = document.querySelectorAll("span");
const menu = document.querySelector(".menu");
const main = document.querySelector("main");

menu.addEventListener("click",()=>{
  barraLateral.classList.toggle("max-barra-lateral");
  if(barraLateral.classList.contains("max-barra-lateral")){
      menu.children[0].style.display = "none";
      menu.children[1].style.display = "block";
  }
  else{
      menu.children[0].style.display = "block";
      menu.children[1].style.display = "none";
  }
  if(window.innerWidth<=320){
      barraLateral.classList.add("mini-barra-lateral");
      main.classList.add("min-main");
      spans.forEach((span)=>{
          span.classList.add("oculto");
      });
  }
});

cloud.addEventListener("click",()=>{
  barraLateral.classList.toggle("mini-barra-lateral");
  main.classList.toggle("min-main");
  spans.forEach((span)=>{
      span.classList.toggle("oculto");
  });
});

document.getElementById('editarPerfilBtn').addEventListener('click', function() {
    document.querySelector('.card').style.display = 'none';
    document.getElementById('editarPerfil').style.display = 'block';
});

document.getElementById('cancelarEdicion').addEventListener('click', function() {
    document.getElementById('editarPerfil').style.display = 'none';
    document.querySelector('.card').style.display = 'block';
});

document.getElementById('fotoPerfil').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('fotoPerfilActual').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Verificar sesión antes de cargar el perfil
document.addEventListener('DOMContentLoaded', function() {
    fetch('../Controlador/cperfil.php')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Usuario no autenticado');
            }
        })
        .then(data => {
            // Mostrar datos del perfil y permitir interacciones
            mostrarDatosPerfil(data);
        })
        .catch(error => {
            console.error('Error al cargar datos del perfil:', error);
            // Redirigir a la página de inicio de sesión si no está autenticado
            window.location.href = '../Controlador/cerrarSesion.php';
        });
});

function mostrarDatosPerfil(data) {
    // Mostrar datos del perfil en la interfaz
    document.getElementById('nombre').textContent = data.nombre;
    document.getElementById('apellidos').textContent = data.apellido_paterno + ' ' + data.apellido_materno;
    document.getElementById('telefono').textContent = data.telefono;
    document.getElementById('correo').textContent = data.correo_institucional;
    document.getElementById('carrera').textContent = data.carrera;
    document.getElementById('nombreEdit').value = data.nombre;
    document.getElementById('apellido_paternoEdit').value = data.apellido_paterno;
    document.getElementById('apellido_maternoEdit').value = data.apellido_materno;
    document.getElementById('telefonoEdit').value = data.telefono;
    document.getElementById('carreraEdit').value = data.carrera;
    document.getElementById('fotoPerfilActual').src = data.img_perfil ? data.img_perfil : '';

    // Mostrar o ocultar elementos según el estado de la sesión
    document.querySelector('.card').style.display = 'block';
    document.getElementById('editarPerfil').style.display = 'none';
}

// Función para mostrar modal de éxito
function mostrarModalExito() {
    var myModal = new bootstrap.Modal(document.getElementById('modalExito'), {
        keyboard: false
    });
    myModal.show();
    setTimeout(function() {
        myModal.hide();
        window.location.href = 'admin-perfil.html';
    }, 2000); // Redirecciona después de 2 segundos
}

// Función para mostrar modal de error
function mostrarModalError(mensaje) {
    var modalError = document.getElementById('modalError');
    var modalMensaje = document.getElementById('mensajeError');
    modalMensaje.textContent = mensaje;
    var myModal = new bootstrap.Modal(modalError, {
        keyboard: false
    });
    myModal.show();
}

// Escuchar el envío del formulario de edición
document.getElementById('formEditarPerfil').addEventListener('submit', function(event) {
    event.preventDefault();
    var formData = new FormData(this);

    fetch('../Controlador/cperfil.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarModalExito();
        } else {
            mostrarModalError(data.error);
        }
    })
    .catch(error => {
        mostrarModalError('Error de conexión. Inténtelo nuevamente.');
    });
});