// let btnRecargar = document.getElementById('tema');
// let bol = false;
// function cambiarTema() {
//     if (bol = true) {
//         document.body.style.backgroundColor = '#202020';
//         document.body.style.color = '#ffffff';
//         btnRecargar.innerHTML = '☀️';
//         bol = false;
//     }else{
//         document.body.style.backgroundColor = '#ffffff';
//         document.body.style.color = '#000000';
//         btnRecargar.innerHTML = '🌙';
//         bol = true;
//     }
// }

function cargarContenido(num) {
    fetch(`${num}.html`)
    .then(res => res.text())
    .then(html => {
        document.getElementById('contenido-dinamico').innerHTML = html;
        document.querySelector('title').innerHTML = `Docs - ${num}`;
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


// document.querySelectorAll('.toggle-btn').forEach(button => {
//     button.addEventListener('click', () => {
//       const content = button.nextElementSibling;
//       content.classList.toggle('open');
//     });

// });


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