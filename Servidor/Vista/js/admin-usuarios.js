const cloud = document.getElementById("cloud");
const barraLateral = document.querySelector(".barra-lateral");
const spans = document.querySelectorAll("span");
const menu = document.querySelector(".menu");
const main = document.querySelector("main");

document.addEventListener('DOMContentLoaded', function() {
    fetch('../Controlador/cusuarios.php')
        .then(response => response.text())
        .then(text => {
            if (text.includes("Usuario no autenticado")) {
                throw new Error('Usuario no autenticado');
            }
            // Si necesitas usar los datos, parsea aquí el JSON si aplica
            // const data = JSON.parse(text);
        })
        .catch(error => {
            console.error('Error al cargar usuarios:', error);
            window.location.href = '../Controlador/cerrarSesion.php';
        });
});



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

document.addEventListener("DOMContentLoaded", function() {
    // Función para cargar los usuarios y manejar acciones de ver y editar
    function cargarUsuarios() {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "../Controlador/cusuarios.php", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                document.getElementById("tabla-usuarios").innerHTML = xhr.responseText;

                // Asignar eventos a los botones Ver y Editar
                const btnsVerUsuario = document.querySelectorAll(".ver-usuario");
                const btnsEditarUsuario = document.querySelectorAll(".editar-usuario");

                btnsVerUsuario.forEach(btn => {
                    btn.addEventListener("click", function() {
                        const idUsuario = this.getAttribute("data-id");
                        verUsuario(idUsuario);
                    });
                });

                btnsEditarUsuario.forEach(btn => {
                    btn.addEventListener("click", function() {
                        const idUsuario = this.getAttribute("data-id");
                        editarUsuario(idUsuario);
                    });
                });
            }
        };
        xhr.send();
    }

    // Función para cargar los detalles del usuario en el modal de ver
    function verUsuario(idUsuario) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "../Controlador/cusuarios.php?action=ver&id_usuario=" + idUsuario, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                document.getElementById("modalVerUsuarioLabel").innerText = "Detalles del Usuario";
                document.getElementById("modalVerUsuarioBody").innerHTML = xhr.responseText;
                const modal = new bootstrap.Modal(document.getElementById('modalVerUsuario'));
                modal.show();
            }
        };
        xhr.send();
    }

    // Función para cargar el formulario de edición del usuario en el modal de editar
    function editarUsuario(idUsuario) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "../Controlador/cusuarios.php?action=editar&id_usuario=" + idUsuario, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                document.getElementById("modalEditarUsuarioLabel").innerText = "Editar Usuario";
                document.getElementById("modalEditarUsuarioBody").innerHTML = xhr.responseText;
                const modal = new bootstrap.Modal(document.getElementById('modalEditarUsuario'));
                modal.show();

                // Escuchar el envío del formulario de edición
                document.getElementById("formEditarUsuario").addEventListener("submit", function(event) {
                    event.preventDefault();
                    const formData = new FormData(this);
                    guardarCambiosUsuario(formData);
                });
            }
        };
        xhr.send();
    }

    // Función para enviar los cambios editados del usuario
    function guardarCambiosUsuario(formData) {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "../Controlador/cusuarios.php", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // Manejar la respuesta después de guardar los cambios
                // Por ejemplo, cerrar el modal o actualizar la tabla de usuarios
                cargarUsuarios();
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario'));
                modal.hide();
            }
        };
        xhr.send(formData);
    }

    // Cargar los usuarios cuando se cargue la página
    cargarUsuarios();
});

// ===================== BUSCAR Y PAGINAR (versión diseño-friendly) =====================
let paginaActual = 1;
let terminoBusqueda = "";

// Búsqueda
let debounceTimer;
document.querySelector(".search-input").addEventListener("input", function () {
    clearTimeout(debounceTimer);
    terminoBusqueda = this.value.trim();
    debounceTimer = setTimeout(() => {
        paginaActual = 1;
        cargarUsuariosConParametros();
    }, 300); // espera 300ms tras dejar de escribir
});

// Paginación
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("pagination-button")) {
        const texto = e.target.textContent.trim();
        if (!isNaN(texto)) {
            paginaActual = parseInt(texto);
        } else if (e.target.querySelector("i.bx-chevron-right")) {
            paginaActual++;
        }
        cargarUsuariosConParametros();
    }
});

// Reusar lógica de carga
function cargarUsuariosConParametros() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `../Controlador/cusuarios.php?pagina=${paginaActual}&buscar=${encodeURIComponent(terminoBusqueda)}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById("tabla-usuarios").innerHTML = xhr.responseText;

            // 💡 Elimina paginación duplicada si existe
           const paginacionExistente = document.getElementById("paginacion");
            if (paginacionExistente) {
                paginacionExistente.remove(); // limpia antes de renderizar nueva
            }


            document.querySelectorAll(".ver-usuario").forEach(btn =>
                btn.addEventListener("click", () => verUsuario(btn.getAttribute("data-id")))
            );
            document.querySelectorAll(".editar-usuario").forEach(btn =>
                btn.addEventListener("click", () => editarUsuario(btn.getAttribute("data-id")))
            );
        }
    };
    xhr.send();
}

