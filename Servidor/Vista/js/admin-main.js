const cloud = document.getElementById("cloud")
const barraLateral = document.querySelector(".barra-lateral")
const spans = document.querySelectorAll("span")
const menu = document.querySelector(".menu")
const main = document.querySelector("main")
const bootstrap = window.bootstrap // Declare the bootstrap variable

// Añadir código para crear y manejar el overlay del menú
// Agregar después de las constantes iniciales

// Crear el overlay para el menú móvil
function createMenuOverlay() {
  // Verificar si ya existe
  if (document.querySelector(".menu-overlay")) return

  const overlay = document.createElement("div")
  overlay.className = "menu-overlay"
  document.body.appendChild(overlay)

  // Cerrar el menú al hacer clic en el overlay
  overlay.addEventListener("click", () => {
    if (barraLateral.classList.contains("max-barra-lateral")) {
      barraLateral.classList.remove("max-barra-lateral")
      menu.children[0].style.display = "block"
      menu.children[1].style.display = "none"
      overlay.classList.remove("active")
    }
  })
}

// Al inicio del archivo, después de las constantes
if (menu.children.length === 0) {
  // Si no hay iconos, los creamos
  const menuIcon = document.createElement("i")
  menuIcon.className = "bx bx-menu"
  const closeIcon = document.createElement("i")
  closeIcon.className = "bx bx-x"
  closeIcon.style.display = "none"
  menu.appendChild(menuIcon)
  menu.appendChild(closeIcon)
} else if (menu.children.length === 2) {
  // Si ya existen los iconos, aseguramos que el primero esté visible y el segundo oculto
  menu.children[0].style.display = "block"
  menu.children[1].style.display = "none"
}

// Modificar el event listener del menú para activar el overlay
// Reemplazar el event listener existente con este:
menu.addEventListener("click", () => {
  // Crear el overlay si no existe
  createMenuOverlay()
  const overlay = document.querySelector(".menu-overlay")

  barraLateral.classList.toggle("max-barra-lateral")
  if (barraLateral.classList.contains("max-barra-lateral")) {
    menu.children[0].style.display = "none"
    menu.children[1].style.display = "block"
    // Mostrar el overlay
    overlay.classList.add("active")
  } else {
    menu.children[0].style.display = "block"
    menu.children[1].style.display = "none"
    // Ocultar el overlay
    overlay.classList.remove("active")
  }

  if (window.innerWidth <= 320) {
    barraLateral.classList.add("mini-barra-lateral")
    main.classList.add("min-main")
    spans.forEach((span) => {
      span.classList.add("oculto")
    })
  }
})

// Cerrar el menú al hacer clic en un enlace (para móviles)
document.querySelectorAll(".navegacion a, .cerrar-sesion-container a").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 768 && barraLateral.classList.contains("max-barra-lateral")) {
      setTimeout(() => {
        barraLateral.classList.remove("max-barra-lateral")
        menu.children[0].style.display = "block"
        menu.children[1].style.display = "none"
        const overlay = document.querySelector(".menu-overlay")
        if (overlay) overlay.classList.remove("active")
      }, 150) // Pequeño retraso para que se vea el efecto de clic
    }
  })
})

document.addEventListener("DOMContentLoaded", () => {
  // Agregar un mensaje de carga
  const tablaAlertas = document.getElementById("tabla-alertas")
  tablaAlertas.innerHTML = `
    <div class="loading-message">
      <div class="spinner"></div>
      <p>Cargando alertas...</p>
    </div>
  `

  function cargarAlertas() {
    const xhr = new XMLHttpRequest()
    xhr.open("GET", "../Controlador/cmain.php", true)

    // Mostrar mensaje de carga
    tablaAlertas.innerHTML = `
      <div class="loading-message">
        <div class="spinner"></div>
        <p>Cargando alertas...</p>
      </div>
    `

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          // Verificar si la respuesta está vacía o no es válida
          if (!xhr.responseText || xhr.responseText.trim() === "") {
            mostrarMensajeVacio()
          } else {
            // Intentar detectar si es un error PHP
            if (
              xhr.responseText.includes("Fatal error") ||
              xhr.responseText.includes("Warning") ||
              xhr.responseText.includes("Notice")
            ) {
              mostrarError("Se ha detectado un error en el servidor. Por favor, contacta al administrador.")
              console.error("Error en la respuesta PHP:", xhr.responseText)
            } else {
              // Respuesta exitosa
              tablaAlertas.innerHTML = xhr.responseText

              // Si no hay datos en la tabla, mostrar mensaje amigable
              if (tablaAlertas.querySelector("table") && !tablaAlertas.querySelector("table tbody tr")) {
                mostrarMensajeVacio()
              }
            }
          }
        } else {
          // Error en la solicitud
          mostrarError(`Error al cargar los datos (${xhr.status}). Por favor, intenta de nuevo.`)
          console.error("Error en la solicitud AJAX:", xhr.status, xhr.statusText)
        }
      }
    }

    xhr.onerror = () => {
      mostrarError("No se pudo conectar con el servidor. Verifica tu conexión a internet.")
      console.error("Error de conexión en la solicitud AJAX")
    }

    xhr.send()
  }

  function mostrarMensajeVacio() {
    tablaAlertas.innerHTML = `
      <div class="empty-data">
        <i class='bx bx-bell-off'></i>
        <p>No hay alertas médicas para mostrar en este momento.</p>
        <button class="btn-refresh" onclick="location.reload()">
          <i class='bx bx-refresh'></i> Actualizar
        </button>
      </div>
    `
  }

  function mostrarError(mensaje) {
    tablaAlertas.innerHTML = `
      <div class="error-message">
        <i class='bx bx-error-circle' style="font-size: 50px; margin-bottom: 15px; color: #e74c3c;"></i>
        <p>${mensaje}</p>
        <button class="btn-refresh" onclick="location.reload()">
          <i class='bx bx-refresh'></i> Intentar de nuevo
        </button>
      </div>
    `
  }

  // Cargar las alertas cuando se cargue la página
  cargarAlertas()

  // Manejar el clic en los botones "Ver" para cargar los detalles de la alerta en una ventana modal
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("ver-alerta")) {
      var idAlerta = event.target.getAttribute("data-id-alerta")
      cargarDetalleAlerta(idAlerta)
    }
  })

  // Manejar el clic en los botones "Editar" para abrir el modal de editar estado
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("editar-alerta")) {
      var idAlerta = event.target.getAttribute("data-id-alerta")
      document.getElementById("idAlertaEditar").value = idAlerta

      // Obtener el estado actual y seleccionarlo en el select
      var estadoActual = event.target.getAttribute("data-estado")
      var selectEstado = document.getElementById("estadoAlerta")
      var option = selectEstado.querySelector(`option[value="${estadoActual}"]`)
      if (option) {
        option.selected = true
      }

      // Mostrar el modal para editar el estado
      var modal = new bootstrap.Modal(document.getElementById("editarEstadoModal"), {
        keyboard: false,
      })
      modal.show()
    }
  })

  // Manejar el clic en el botón "Guardar" para guardar el nuevo estado
  document.getElementById("guardarEstado").addEventListener("click", () => {
    var idAlerta = document.getElementById("idAlertaEditar").value
    var nuevoEstado = document.getElementById("estadoAlerta").value

    // Realizar la solicitud para actualizar el estado
    const xhr = new XMLHttpRequest()
    xhr.open("POST", "../Controlador/cmain.php", true)
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        // Recargar la tabla de alertas después de actualizar
        cargarAlertas()
        // Cerrar el modal de edición de estado
        var modal = bootstrap.Modal.getInstance(document.getElementById("editarEstadoModal"))
        modal.hide()
      }
    }
    xhr.send(`id_alerta=${idAlerta}&nuevo_estado=${nuevoEstado}`)
  })

  function cargarDetalleAlerta(idAlerta) {
    const xhr = new XMLHttpRequest()
    xhr.open("GET", "../Controlador/cmain.php?id_alerta=" + idAlerta, true)

    // Mostrar mensaje de carga en el modal
    document.getElementById("modalBody").innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; flex-direction: column; padding: 20px;">
        <div class="spinner"></div>
        <p style="margin-top: 15px;">Cargando detalles...</p>
      </div>
    `

    // Mostrar el modal mientras carga
    var modal = new bootstrap.Modal(document.getElementById("alertaModal"), {
      keyboard: false,
    })
    modal.show()

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            // Obtener los detalles de la alerta desde la respuesta JSON
            var detallesAlerta = JSON.parse(xhr.responseText)

            // Formatear la fecha
            var fecha = new Date(detallesAlerta.fecha)
            var opcionesFecha = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
            var fechaFormateada = fecha.toLocaleDateString("es-PE", opcionesFecha)
            var horaFormateada = fecha.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })

            // Aplicar ucfirst solo al primer carácter del día
            fechaFormateada = fechaFormateada.replace(/^\w/, (match) => match.toUpperCase())

            // Obtener el color del estado
            var estadoColor = getEstadoColor(detallesAlerta.estado)

            // Construir el contenido del modal
            var modalBody = `
              <p><strong>Fecha:</strong> ${fechaFormateada} | ${horaFormateada}</p>
              <p><strong>Ubicación:</strong> ${detallesAlerta.ubicacion}</p>
              ${detallesAlerta.piso ? `<p><strong>Piso:</strong> ${detallesAlerta.piso}</p>` : ""}
              <p><strong>Especificación:</strong> ${detallesAlerta.especificacion}</p>
              <p><strong>Descripción:</strong> ${detallesAlerta.descripcion}</p>
              <p><strong>Síntomas:</strong> ${detallesAlerta.sintomas}</p>
              ${detallesAlerta.notas ? `<p><strong>Notas:</strong> ${detallesAlerta.notas}</p>` : ""}
              <p><strong>Estado:</strong> <span class="estado-badge ${getEstadoClass(detallesAlerta.estado)}">${detallesAlerta.estado}</span></p>
              <p><strong>Reportado por:</strong> ${detallesAlerta.nombre} ${detallesAlerta.apellido_paterno} ${detallesAlerta.apellido_materno}</p>
              <p><strong>Correo:</strong> ${detallesAlerta.correo_institucional}</p>
              <p><strong>Carrera:</strong> ${detallesAlerta.carrera}</p>
            `
            document.getElementById("modalBody").innerHTML = modalBody
          } catch (e) {
            // Error al parsear JSON
            document.getElementById("modalBody").innerHTML = `
              <div class="error-message" style="position: relative; background: none;">
                <i class='bx bx-error-circle' style="font-size: 40px; margin-bottom: 15px; color: #e74c3c;"></i>
                <p>Error al cargar los detalles de la alerta. Por favor, intenta de nuevo.</p>
              </div>
            `
            console.error("Error al parsear JSON:", e, xhr.responseText)
          }
        } else {
          // Error en la solicitud
          document.getElementById("modalBody").innerHTML = `
            <div class="error-message" style="position: relative; background: none;">
              <i class='bx bx-error-circle' style="font-size: 40px; margin-bottom: 15px; color: #e74c3c;"></i>
              <p>Error al cargar los detalles. Por favor, intenta de nuevo.</p>
            </div>
          `
        }
      }
    }
    xhr.send()
  }

  // Función para obtener el color de estado basado en el valor del estado
  function getEstadoColor(estado) {
    switch (estado) {
      case "Pendiente":
        return "btn-danger btn-sm"
      case "En proceso":
        return "btn-warning btn-sm"
      case "Atendido":
        return "btn-success btn-sm"
      case "Cancelado":
        return "btn-secondary btn-sm"
      default:
        return "btn-secondary btn-sm"
    }
  }

  // Función para obtener la clase CSS del estado
  function getEstadoClass(estado) {
    switch (estado) {
      case "Pendiente":
        return "estado-pendiente"
      case "En proceso":
        return "estado-proceso"
      case "Atendido":
        return "estado-atendido"
      case "Cancelado":
        return "estado-cancelado"
      default:
        return ""
    }
  }
})

// Función para depurar la respuesta del servidor
function debugResponse(response) {
  console.log("Respuesta del servidor:", response)

  // Crear un elemento para mostrar la respuesta en la página
  const debugDiv = document.createElement("div")
  debugDiv.style.padding = "20px"
  debugDiv.style.margin = "20px 0"
  debugDiv.style.background = "#f8f9fa"
  debugDiv.style.border = "1px solid #ddd"
  debugDiv.style.borderRadius = "5px"
  debugDiv.style.whiteSpace = "pre-wrap"
  debugDiv.style.overflow = "auto"
  debugDiv.style.maxHeight = "300px"

  // Escapar HTML para evitar problemas de renderizado
  const escapedResponse = response
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")

  debugDiv.innerHTML = `<h4>Respuesta del servidor (para depuración):</h4><code>${escapedResponse}</code>`

  // Agregar al DOM
  document.getElementById("tabla-alertas").appendChild(debugDiv)
}
