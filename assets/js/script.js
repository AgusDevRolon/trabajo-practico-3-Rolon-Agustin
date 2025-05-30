// Elementos del DOM
const form = document.getElementById('form-busqueda');
const contenedor = document.getElementById('personajes');
const input = document.getElementById('nombre_buscar');
const mensaje = document.getElementById('mensaje');

// Cargar personajes al iniciar
document.addEventListener('DOMContentLoaded', cargarPersonajesIniciales);

async function cargarPersonajesIniciales() {
  try {
    const response = await fetch('https://dragonball-api.com/api/characters');
    const data = await response.json();
    mostrarPersonajes(data.items);
  } catch (error) {
    console.error('Error:', error);
  }
}

function mostrarPersonajes(personajes) {
  personajes.forEach(personaje => {
    const div = document.createElement('div');
    div.className = 'col mb-4';
    div.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${personaje.image || 'https://via.placeholder.com/300'}" 
             class="card-img-top" 
             alt="${personaje.name}"
             onerror="this.src='https://via.placeholder.com/300'">
        <div class="card-body">
          <h5 class="card-title">${personaje.name}</h5>
          <p class="card-text"><strong>Raza:</strong> ${personaje.race || 'Desconocida'}</p>
          <p class="card-text"><strong>Género:</strong> ${personaje.gender || 'Desconocido'}</p>
        </div>
         <div class="card-footer bg-transparent">
          <button class="btn btn-outline-primary btn-sm btn-detalle" data-id="${personaje.id}">
            Ver detalles
          </button>
        </div>
      </div>
      </div>
    `;
    contenedor.appendChild(div);
  });
}
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = input.value.trim();
  
  if (nombre === '') {
    mostrarMensaje('Por favor ingresa un nombre', 'warning');
    return;
  }
  
  await buscarPersonajes(nombre);
});

async function buscarPersonajes(nombre) {
  try {
    const response = await fetch(`https://dragonball-api.com/api/characters?name=${encodeURIComponent(nombre)}`);
    const data = await response.json();
    
    contenedor.innerHTML = '';
    if (!data || data.length === 0) {
      mostrarMensaje('No se encontraron resultados', 'info');
      return;
    }
    
    mostrarPersonajes(Array.isArray(data) ? data : [data]);
  } catch (error) {
    mostrarMensaje('Error al buscar', 'danger');
    console.error(error);
  }
}

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = `alert alert-${tipo}`;
  mensaje.style.display = 'block';
}

document.querySelectorAll('.btn-detalle').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.getAttribute('data-id');
    mostrarDetallesPersonaje(id);
  });
});

async function mostrarDetallesPersonaje(id) {
  try {
    const response = await fetch(`https://dragonball-api.com/api/characters/${id}`);
    const personaje = await response.json();
    
    document.getElementById('modal-titulo').textContent = personaje.name;
    document.getElementById('modal-cuerpo').innerHTML = `
      <p><strong>Ki:</strong> ${personaje.ki || 'N/A'}</p>
      <p><strong>Afiliación:</strong> ${personaje.affiliation || 'Desconocida'}</p>
    `;
    
    // Mostrar modal (necesitas bootstrap.js)
    new bootstrap.Modal(document.getElementById('modal-detalles')).show();
  } catch (error) {
    console.error('Error:', error);
  }
}