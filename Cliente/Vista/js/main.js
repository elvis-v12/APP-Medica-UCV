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


const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  fetch('../Controlador/main.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
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
  .catch(error => {
    console.error('Error:', error);
    alert('Error al enviar la alerta.');
  });
});

// Seleccionar Pabellón A por defecto
const buildingSelect = document.getElementById('ubicacion');
const floorSelect = document.getElementById('piso');
const floorContainer = floorSelect.parentNode;

// Mostrar el select de pisos y habilitarlo con las opciones correspondientes
floorContainer.style.display = 'none';
floorSelect.disabled = true;

// Agregar evento de cambio al select de edificios
buildingSelect.addEventListener('change', function() {
  const selectedBuilding = buildingSelect.value;
  const floors = getFloorsForBuilding(selectedBuilding);
  
  // Mostrar o ocultar el select de pisos según la opción seleccionada
  if (floors) {
    floorContainer.style.display = 'block';
    floorSelect.disabled = false;
    floorSelect.innerHTML = '<option value="" disabled selected>Seleccione un piso</option>';
    floors.forEach(function(piso) {
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

// Función para obtener los pisos para un edificio específico
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
