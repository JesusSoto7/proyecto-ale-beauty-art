let temaOscuro = false; // Variable global para guardar el estado
const btnRecargar = document.getElementById('tema');
const nav = document.querySelector('nav');
const pres = document.querySelectorAll('pre');
const aside = document.querySelector('aside');
const title = document.querySelectorAll('.title');
const cards = document.querySelectorAll('.card');
const btnA = document.querySelectorAll('.btn-recargar');
const contO = document.querySelectorAll('.content');
const btnsC = document.querySelectorAll('.menu-btn');
const logo = document.getElementById('logo');


function activarOscuro() {
  document.body.style.backgroundColor = '#1a1a1a';
  nav.style.backgroundColor = '#333';
  nav.style.border = 'none';
  nav.style.boxShadow = 'inset 8px 0px 12px -4px #2d2828db';
  aside.style.backgroundColor = '#302d2cff';
  aside.style.border = 'none';
  aside.style.color = '#ffffff';
  document.querySelectorAll('.card').forEach(card => {
    card.style.backgroundColor = '#3f3b3a';
    card.style.border = 'none';
  });

  document.querySelectorAll('pre').forEach(pre => {
    pre.style.backgroundColor = '#3d3c3c';
  });

  document.querySelectorAll('.title').forEach(card => {
    card.style.color = '#ffffff';
  });

  btnA.forEach(btn => {
    btn.style.backgroundColor = '';
    btn.style.color = '#ffffff';
  });
  contO.forEach(cont => {
    cont.style.backgroundColor = '#302d2cff';
    cont.style.color = '#ffffff';
  });
  btnsC.forEach(btn => btn.style.color = '#ffffff');
  document.body.style.color = '#ffffff';
  logo.style.backgroundColor = '#333';
  logo.style.border = 'none';
  btnRecargar.innerHTML = '<i class="fa-solid fa-moon fa-lg"></i>';
  temaOscuro = true;
}

function activarClaro() {
  document.body.style.backgroundColor = '#ffffff';
  document.body.style.color = '#000000';
  nav.style.backgroundColor = '';
  nav.style.border = '';
  nav.style.boxShadow = '';
  aside.style.backgroundColor = '';
  aside.style.color = '';
  aside.style.border = '';
  contO.forEach(cont => {
    cont.style.backgroundColor = '';
    cont.style.color = '';
  });

  document.querySelectorAll('.card').forEach(card => {
    card.style.backgroundColor = '';
    card.style.border = '';
  });

  document.querySelectorAll('pre').forEach(pre => {
    pre.style.backgroundColor = '';
  });

  document.querySelectorAll('.title').forEach(card => {
    card.style.color = '';
  });
  
  btnA.forEach(btn => {
    btn.style.backgroundColor = '';
    btn.style.color = '';
  });
  btnsC.forEach(btn => btn.style.color = '');
  logo.style.backgroundColor = '';
  logo.style.border = '';
  btnRecargar.innerHTML = '<i class="fa-solid fa-sun fa-lg"></i>';
  temaOscuro = false;
}

function cambiarTema() {
  if (temaOscuro) {
    activarClaro();
  } else {
    activarOscuro();
  }
}


function cargarContenido(num) {
    fetch(`${num}.html`)
    .then(res => res.text())
    .then(html => {
        document.getElementById('contenido-dinamico').innerHTML = html;
        document.querySelector('title').innerHTML = `Docs - ${num}`;
        if (temaOscuro) activarOscuro();
    })
    .catch(err => {
        console.error("Error al cargar el fragmento:", err);
    });
}


// document.getElementById('btn-recargar').addEventListener('click', cargarContenido);

document.addEventListener('DOMContentLoaded', () => {
    cargarContenido('inicio'); //aqui puedes agregar la pagina en la que estas trabajando :D
});

function changeColor(selectedButton) {
    let buttons = document.querySelectorAll('.btn-recargar');
    buttons.forEach(button => button.classList.remove('active'));
    selectedButton.classList.add('active');
    
}


document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".toggle-btn");

  // Restaurar las secciones abiertas desde localStorage
  const openedSections = JSON.parse(localStorage.getItem("aside-opened") || "[]");

  buttons.forEach((button, index) => {
    const content = button.nextElementSibling;

    // Si estaba abierta antes, la volvemos a abrir
    if (openedSections.includes(index)) {
      content.classList.add("open");
    
      toggleIcons(button, true);
    }

    // Al hacer clic en el botón
    button.addEventListener("click", () => {
      const isOpen = content.classList.toggle("open");

      toggleIcons(button, isOpen);

      // Actualizar el array en localStorage
      const updatedOpen = new Set(openedSections);
      if (isOpen) {
        updatedOpen.add(index);
      } else {
        updatedOpen.delete(index);
      }
      localStorage.setItem("aside-opened", JSON.stringify([...updatedOpen]));
    });
  });

  // Función para cambiar los íconos de carpeta y flecha
  function toggleIcons(button, open) {
    const folderIcon = button.querySelector(".fa-folder, .fa-folder-open");
    const chevronIcon = button.querySelector(".fa-chevron-down, .fa-chevron-up");

    if (folderIcon) {
      folderIcon.classList.toggle("fa-folder", !open);
      folderIcon.classList.toggle("fa-folder-open", open);
    }
    if (chevronIcon) {
      chevronIcon.classList.toggle("fa-chevron-down", !open);
      chevronIcon.classList.toggle("fa-chevron-up", open);
    }
  }

});