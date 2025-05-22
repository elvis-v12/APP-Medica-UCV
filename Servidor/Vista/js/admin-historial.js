const cloud = document.getElementById("cloud")
const barraLateral = document.querySelector(".barra-lateral")
const spans = document.querySelectorAll("span")
const menu = document.querySelector(".menu")
const main = document.querySelector("main")
const bootstrap = window.bootstrap // Declare the bootstrap variable

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

document.addEventListener("DOMContentLoaded", () => {
  fetch("../Controlador/admin-historial.php")
    .then((response) => response.text())
    .then((text) => {
      if (text.includes("Usuario no autenticado")) {
        throw new Error("Usuario no autenticado")
      }
      // Si necesitas usar los datos, parsea aquí el JSON si aplica
      // const data = JSON.parse(text);
    })
    .catch((error) => {
      console.error("Error al cargar historial:", error)
      window.location.href = "../Controlador/cerrarSesion.php"
    })
})

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
  function cargarHistorial() {
    const xhr = new XMLHttpRequest()
    xhr.open("GET", "../Controlador/admin-historial.php", true)
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        document.getElementById("tabla-historial").innerHTML = xhr.responseText
      }
    }
    xhr.send()
  }

  // Cargar el historial cuando se cargue la página
  cargarHistorial()

  // Manejar el clic en los botones "Ver" para cargar los detalles de la alerta en una ventana modal
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("ver-alerta")) {
      var idAlerta = event.target.getAttribute("data-id-alerta")
      cargarDetalleAlerta(idAlerta)
    }
  })

  function cargarDetalleAlerta(idAlerta) {
    const xhr = new XMLHttpRequest()
    xhr.open("GET", "../Controlador/admin-historial.php?id_alerta=" + idAlerta, true)
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
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

        // Mostrar los detalles en el modal
        document.getElementById("modalBody").innerHTML = `
                    <p><strong>ID de la Alerta:</strong> ${detallesAlerta.id_alerta}</p>
                    <p><strong>Ubicación:</strong> ${detallesAlerta.ubicacion}</p>
                    ${detallesAlerta.piso ? `<p><strong>Piso:</strong> ${detallesAlerta.piso}</p>` : ""}
                    <p><strong>Especificación:</strong> ${detallesAlerta.especificacion}</p>
                    <p><strong>Descripción:</strong> ${detallesAlerta.descripcion}</p>
                    <p><strong>Síntomas:</strong> ${detallesAlerta.sintomas}</p>
                    ${detallesAlerta.notas ? `<p><strong>Notas:</strong> ${detallesAlerta.notas}</p>` : ""}
                    <p><strong>Fecha:</strong> ${fechaFormateada} | ${horaFormateada}</p>
                    <p><strong>Estado:</strong> <button class="btn ${estadoColor}" disabled>${detallesAlerta.estado}</button></p>
                `

        // Mostrar el modal
        var modal = new bootstrap.Modal(document.getElementById("alertaModal"), {
          keyboard: false,
        })
        modal.show()
      }
    }
    xhr.send()
  }

  // Manejar el cierre del modal para limpiar el contenido
  document.getElementById("alertaModal").addEventListener("hidden.bs.modal", () => {
    document.getElementById("modalBody").innerHTML = ""
  })

  // Función para obtener el color de estado basado en el valor del estado
  function getEstadoColor(estado) {
    switch (estado) {
      case "Pendiente":
        return "btn-danger btn-sm"
      case "En proceso":
        return "btn-warning btn-sm"
      case "Atendido":
        return "btn-success btn-sm"
      default:
        return "btn-secondary btn-sm"
    }
  }
})
