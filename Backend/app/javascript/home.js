// let theme = document.getElementById('tema');
// let refr = document.getElementById('refesh');
// let asid = document.getElementById('aside');
// let bol = false;

// function cambiarTema() {
//     // let i = theme.querySelector('i');
//     if (bol = true) {
//         refr.style.backgroundColor = '#202020';
//         asid.style.backgroundColor = '#202020';
//         document.body.style.color = '#ffffff';
//         // i.classList.remove = 'fa-moon';
//         // i.classList.add = 'fa-sun';
//         bol = false;
//     }else{
//         refr.style.backgroundColor = '#fffffd';
//         asid.style.backgroundColor = '#fffffd';
//         document.body.style.color = 'black';
//         // i.classList.remove = 'fa-sun';
//         // i.classList.add = 'fa-moon';
//         bol = true;
//     }
// }

// --------------------------------------------------------------------------------

// function changeColor(selectedButton) {
//     let buttons = document.querySelectorAll('.btn-recargar');
//     buttons.forEach(button => button.classList.remove('active'));
//     selectedButton.classList.add('active');
    
//     // funcion para cambiar color de boton selecionado
// }


// document.querySelectorAll('.toggle-btn').forEach(button => {
//   button.addEventListener('click', () => {
//     const content = button.nextElementSibling;
//     content.classList.toggle('open');

//     button.classList.toggle("active");

//     const folderIcon = button.querySelector(".fa-folder, .fa-folder-open");

//     const chevronIcon = button.querySelector(".fa-chevron-down, .fa-chevron-up");

//     if (button.classList.contains("active")) {
//       folderIcon.classList.remove("fa-folder");
//       folderIcon.classList.add("fa-folder-open");

//       chevronIcon.classList.remove("fa-chevron-down");
//       chevronIcon.classList.add("fa-chevron-up");
//     } else {
//       folderIcon.classList.remove("fa-folder-open");
//       folderIcon.classList.add("fa-folder");

//       chevronIcon.classList.remove("fa-chevron-up");
//       chevronIcon.classList.add("fa-chevron-down");
//     }
//   });
// });

// document.addEventListener("DOMContentLoaded", () => {
//   const buttons = document.querySelectorAll(".toggle-btn");

//       // Obtener cuál fue la última sección abierta
//       const lastOpenIndex = localStorage.getItem("aside-last-open");

//       buttons.forEach((button, index) => {
//         const content = button.nextElementSibling;

//         // Si es la última abierta, abrirla
//         if (parseInt(lastOpenIndex) === index) {
//           content.classList.add("open");
//         }

//         button.addEventListener("click", () => {
//           // Cerrar todas las demás secciones
//           document.querySelectorAll(".content").forEach(c => c.classList.remove("open"));

//           // Abrir solo la actual
//           content.classList.add("open");

//           // Guardar el índice como la última abierta
//           localStorage.setItem("aside-last-open", index);
//         });
//       });
// });


// --------------------------------------------------------------------



document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".toggle-btn");

  // Restaurar las secciones abiertas desde localStorage
  const openedSections = JSON.parse(localStorage.getItem("aside-opened") || "[]");

  buttons.forEach((button, index) => {
    const content = button.nextElementSibling;

    // Si estaba abierta antes, la volvemos a abrir
    if (openedSections.includes(index)) {
      content.classList.add("open");
      button.classList.add("active");
      toggleIcons(button, true);
    }

    // Al hacer clic en el botón
    button.addEventListener("click", () => {
      const isOpen = content.classList.toggle("open");
      button.classList.toggle("active");

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

