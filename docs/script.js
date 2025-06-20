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
        document.querySelector('title').innerHTML = `Docs: ${num}`;
    })
    .catch(err => {
        console.error("Error al cargar el fragmento:", err);
    });
}


// document.getElementById('btn-recargar').addEventListener('click', cargarContenido);

document.addEventListener('DOMContentLoaded', () => {
    cargarContenido('estructura'); //aqui puedes agregar la pagina que estas trabajando :D
});

function changeColor(selectedButton) {
    let buttons = document.querySelectorAll('.btn-recargar');
    buttons.forEach(button => button.classList.remove('active'));
    selectedButton.classList.add('active');
    
}


document.querySelectorAll('.toggle-btn').forEach(button => {
    button.addEventListener('click', () => {
      const content = button.nextElementSibling;
      content.classList.toggle('open');
    });

});
