const cloud = document.getElementById("cloud");
const barraLateral = document.querySelector(".barra-lateral");
const spans = document.querySelectorAll("span");
const menu = document.querySelector(".menu");
const main = document.querySelector("main");

menu.addEventListener("click", () => {
  barraLateral.classList.toggle("max-barra-lateral");
  if(menu.children.length >= 2 ){
  if (barraLateral.classList.contains("max-barra-lateral")) {
    menu.children[0].style.display = "none";
    menu.children[1].style.display = "block";
  } else {
    menu.children[0].style.display = "block";
    menu.children[1].style.display = "none";
  }
}
  if (window.innerWidth <= 320) {
    barraLateral.classList.add("mini-barra-lateral");
    main.classList.add("min-main");
    spans.forEach((span) => {
      span.classList.add("oculto");
    });
  }
});

const form = document.querySelector('form');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    fetch('../Controlador/main.php', {
      method: 'POST',
      body: formData
    })
      .then(async (response) => {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json();
        } else {
          const text = await response.text();
          console.warn("Respuesta no JSON:", text);
          throw new Error("Respuesta inesperada del servidor.");
        }
      })
      .then((data) => {
        if (data.status === 'success') {
          alert(data.message);
          window.location.href = '../Vista/registro-emergencia.html';
        } else {
          alert(data.message);
          if (data.message === 'Usuario no autenticado.') {
            window.location.href = '../Vista/index.html';
          }
        }
      })
      .catch((error) => {
        console.error('Error al enviar datos:', error);
        alert('Error al enviar la alerta.');
      });
  });
} else {
  console.warn("No se encontró ningún formulario en esta vista.");
}

// Seleccionar Pabellón A por defecto
const buildingSelect = document.getElementById('ubicacion');
const floorSelect = document.getElementById('piso');

if (buildingSelect && floorSelect) {
  const floorContainer = floorSelect.parentNode;

  // Ocultar y desactivar al inicio
  floorContainer.style.display = 'none';
  floorSelect.disabled = true;

  buildingSelect.addEventListener('change', function () {
    const selectedBuilding = buildingSelect.value;
    const floors = getFloorsForBuilding(selectedBuilding);

    if (floors) {
      floorContainer.style.display = 'block';
      floorSelect.disabled = false;
      floorSelect.innerHTML = '<option value="" disabled selected>Seleccione un piso</option>';
      floors.forEach(function (piso) {
        const option = document.createElement('option');
        option.value = piso;
        option.text = `Piso ${piso}`;
        floorSelect.appendChild(option);
      });
    } else {
      floorContainer.style.display = 'none';
      floorSelect.disabled = true;
    }
  });
}

function getFloorsForBuilding(ubicacion) {
  switch (ubicacion) {
    case 'Pabellón A':
      return [1, 2, 3, 4, 5, 6, 7, 8];
    case 'Pabellón B':
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    default:
      return null;
  }
}
