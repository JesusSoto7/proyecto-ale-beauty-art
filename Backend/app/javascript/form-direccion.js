document.addEventListener("DOMContentLoaded", function () {
  const departmentSelect = document.getElementById("department_select");
  const municipalitySelect = document.getElementById("municipality_select");
  const neighborhoodSelect = document.getElementById("neighborhood_select");

  departmentSelect.addEventListener("change", function () {
    const departmentId = this.value;

    municipalitySelect.innerHTML = '<option value="">Cargando...</option>';
   
    fetch(`/locations/municipalities?department_id=${departmentId}`)

      .then(response => response.json())
      .then(data => {
        municipalitySelect.innerHTML = '<option value="">Seleccione un municipio</option>';
        data.forEach(muni => {
          const option = document.createElement("option");
          option.value = muni.id;
          option.textContent = muni.nombre;
          municipalitySelect.appendChild(option);
        });

        neighborhoodSelect.innerHTML = '<option value="">Seleccione un barrio</option>';
    });
  });

  municipalitySelect.addEventListener("change", function () {
    const municipalityId = this.value;

    neighborhoodSelect.innerHTML = '<option value="">Cargando...</option>';
   fetch(`/locations/neighborhoods?municipality_id=${municipalityId}`)
      .then(response => response.json())
      .then(data => {
        neighborhoodSelect.innerHTML = '<option value="">Seleccione un barrio</option>';
        data.forEach(neigh => {
          const option = document.createElement("option");
          option.value = neigh.id;
          option.textContent = neigh.nombre;
          neighborhoodSelect.appendChild(option);
        });
      });
  });
});
