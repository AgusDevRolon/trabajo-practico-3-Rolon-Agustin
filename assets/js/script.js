// Elementos del DOM
const form = document.getElementById('form-busqueda');
const contenedor = document.getElementById('personajes');

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
        <img src="${personaje.image}" class="card-img-top" alt="${personaje.name}">
        <div class="card-body">
          <h5 class="card-title">${personaje.name}</h5>
        </div>
      </div>
    `;
    contenedor.appendChild(div);
  });
}