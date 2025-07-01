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

  // Manejo del botón de filtro
  const filterButton = document.getElementById('Verfiltro');
  const filterSection = document.getElementById('filtro');

  if (filterButton && filterSection) {
    filterButton.addEventListener('click', () => {
      filterSection.classList.toggle('oculto');
    });
  }

});

// Animaciones con GSAP
let alerta = document.getElementById('flash-message');

gsap.from(alerta, {
    x: 300
})

// fin de animaciones con GSAP

// graficas home

const ctx = document.getElementById('graficoBarras').getContext('2d');
const grafico = new Chart(ctx, {
    type: 'bar',
    data: {
    labels: ['1-10 Aug', '11-20 Aug', '21-30 Aug'],
    datasets: [{
        label: 'Visitas',
        data: [25, 45, 60],
        backgroundColor: [
        'rgba(132, 94, 247, 0.4)',
        'rgba(132, 94, 247, 0.6)',
        'rgba(132, 94, 247, 1)'
        ],
        borderRadius: 10,
        barPercentage: 0.6,
        categoryPercentage: 0.6
    }]
    },
    options: {
    responsive: true,
    scales: {
        y: {
        beginAtZero: true,
        min: 20,
        max: 80,
        ticks: {
            stepSize: 20
        },
        grid: {
            drawBorder: false,
            color: '#e5e5e5'
        }
        },
        x: {
        grid: {
            display: false
        }
        }
    },
    plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
    }
    }
});


const ctx2 = document.getElementById('donutChart').getContext('2d');
new Chart(ctx2, {
    type: 'doughnut',
    data: {
    labels: ['Bases', 'labial', 'pestañina'],
    datasets: [{
        data: [40, 30, 20],
        backgroundColor: [
        '#6f42c1', 
        '#d63384', 
        '#000000'  
        ],
        borderWidth: 6,
        hoverOffset: 10,
        borderRadius: 20,
        cutout: '70%'
    }]
    },
    options: {
    responsive: true,
    plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
    }
    }
});
