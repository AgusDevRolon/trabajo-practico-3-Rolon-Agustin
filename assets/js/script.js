// Constantes y variables globales
const API_URL = 'https://dragonball-api.com/api';
let currentPage = 1;
let isLoading = false;
let hasMore = true;
let searchTerm = '';

// Elementos del DOM
const form = document.getElementById('form-busqueda');
const input = document.getElementById('nombre_buscar');
const mensaje = document.getElementById('mensaje');
const contenedor = document.getElementById('personajes');
const loading = document.getElementById('loading');
const loadingScroll = document.getElementById('loading-scroll');
const btnLimpiar = document.getElementById('btn-limpiar');
const modalDetalles = new bootstrap.Modal(document.getElementById('modal-detalles'));


document.addEventListener('DOMContentLoaded', () => {
  cargarPersonajes();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  searchTerm = input.value.trim();
  currentPage = 1;
  contenedor.innerHTML = '';
  hasMore = true;
  
  if (searchTerm === '') {
    mostrarMensaje('Por favor ingresa un nombre para buscar', 'warning');
    return;
  }
  
  await buscarPersonajes();
});

btnLimpiar.addEventListener('click', () => {
  input.value = '';
  searchTerm = '';
  currentPage = 1;
  contenedor.innerHTML = '';
  hasMore = true;
  cargarPersonajes();
});

// Scroll infinito
window.addEventListener('scroll', () => {
  if (isLoading || !hasMore) return;
  
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    currentPage++;
    if (searchTerm) {
      buscarPersonajes();
    } else {
      cargarPersonajes();
    }
  }
});

// Funciones principales
async function cargarPersonajes() {
  if (isLoading) return;
  isLoading = true;
  
  toggleLoading(true);
  ocultarMensaje();
  
  try {
    const response = await fetch(`${API_URL}/characters?page=${currentPage}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      hasMore = false;
      if (currentPage === 1) {
        mostrarMensaje('No se encontraron personajes', 'info');
      }
      return;
    }
    
    mostrarPersonajes(data.items);
    
    // Bonus: Scroll infinito
    if (data.items.length < 10) {
      hasMore = false;
    }
  } catch (error) {
    console.error('Error al cargar personajes:', error);
    mostrarMensaje('Error al cargar personajes. Intenta nuevamente.', 'danger');
  } finally {
    isLoading = false;
    toggleLoading(false);
  }
}

async function buscarPersonajes() {
  if (isLoading) return;
  isLoading = true;
  
  toggleLoading(true);
  ocultarMensaje();
  
  try {
    const response = await fetch(`${API_URL}/characters?name=${encodeURIComponent(searchTerm)}&page=${currentPage}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Manejar diferentes formatos de respuesta
    let personajes = [];
    if (Array.isArray(data)) {
      personajes = data;
    } else if (data.items) {
      personajes = data.items;
    } else if (data) {
      personajes = [data];
    }
    
    if (personajes.length === 0) {
      hasMore = false;
      mostrarMensaje(`No se encontraron personajes con el nombre "${searchTerm}"`, 'info');
      return;
    }
    
    mostrarPersonajes(personajes);
    
    // Bonus: Scroll infinito
    if (personajes.length < 10) {
      hasMore = false;
    }
  } catch (error) {
    console.error('Error en la búsqueda:', error);
    mostrarMensaje('Error al buscar personajes. Intenta nuevamente.', 'danger');
  } finally {
    isLoading = false;
    toggleLoading(false);
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
    `;
    contenedor.appendChild(div);
  });
  
  // Bonus: Modal de detalles
  document.querySelectorAll('.btn-detalle').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      await mostrarDetallesPersonaje(id);
    });
  });
}

// Bonus: Mostrar detalles del personaje en modal
async function mostrarDetallesPersonaje(id) {
  toggleLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/characters/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const personaje = await response.json();
    
    document.getElementById('modal-titulo').textContent = personaje.name;
    
    const modalBody = document.getElementById('modal-cuerpo');
    modalBody.innerHTML = `
      <div class="row">
        <div class="col-md-4">
          <img src="${personaje.image || 'https://via.placeholder.com/300'}" 
               class="img-fluid rounded mb-3" 
               alt="${personaje.name}"
               onerror="this.src='https://via.placeholder.com/300'">
        </div>
        <div class="col-md-8">
          <p><strong>Raza:</strong> ${personaje.race || 'Desconocida'}</p>
          <p><strong>Género:</strong> ${personaje.gender || 'Desconocido'}</p>
          <p><strong>Ki:</strong> ${personaje.ki || 'N/A'}</p>
          <p><strong>Afiliación:</strong> ${personaje.affiliation || 'Desconocida'}</p>
          ${personaje.description ? `<p><strong>Descripción:</strong> ${personaje.description}</p>` : ''}
        </div>
      </div>
    `;
    
    modalDetalles.show();
  } catch (error) {
    console.error('Error al cargar detalles:', error);
    mostrarMensaje('Error al cargar detalles del personaje', 'danger');
  } finally {
    toggleLoading(false);
  }
}

// Funciones auxiliares
function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = `alert alert-${tipo}`;
  mensaje.style.display = 'block';
}

function ocultarMensaje() {
  mensaje.style.display = 'none';
}

function toggleLoading(show) {
  if (currentPage === 1) {
    loading.style.display = show ? 'block' : 'none';
  } else {
    loadingScroll.style.display = show ? 'block' : 'none';
  }
}
