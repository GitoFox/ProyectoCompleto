var Fn = {
  // Valida el rut con su cadena completa "XXXXXXXX-X"
  validaRut: function (rutCompleto) {
    rutCompleto = rutCompleto.replace("‐", "-");
    if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rutCompleto))
      return false;
    var tmp = rutCompleto.split('-');
    var digv = tmp[1];
    var rut = tmp[0];
    if (digv == 'K') digv = 'k';

    return (Fn.dv(rut) == digv);
  },
  dv: function (T) {
    var M = 0,
      S = 1;
    for (; T; T = Math.floor(T / 10))
      S = (S + T % 10 * (9 - M++ % 6)) % 11;
    return S ? S - 1 : 'k';
  }
}

function escapeHTML(text) {
  var element = document.createElement('div');
  element.innerText = text;
  return element.innerHTML;
}

function buscarEmpleado() {

  const rutInput = document.getElementById('rut');
  let rut = rutInput.value.trim();

  // Ajustar automáticamente el formato del Rut si es necesario
  rut = rut.replace(/[^\dkK]+/g, ''); // Eliminar caracteres no válidos
  rut = rut.slice(0, -1) + '-' + rut.slice(-1); // Agregar guión antes del dígito verificador

  rutInput.value = rut; // Actualizar el valor del campo de entrada
  if (!Fn.validaRut(rut)) {
    // Rut inválido, mostrar mensaje de error
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.textContent = 'El Rut no es válido.';

    return; // Salir de la función si el Rut es inválido
  }

  setTimeout(function() {
    // Realizar la solicitud al API para buscar al empleado por su RUT
    fetch(`http://localhost:3000/encuestadores/${rut}`)
      .then(response => response.json())
      .then(data => {
        // Mostrar el resultado
        const resultadoDiv = document.getElementById('resultado');
        resultadoDiv.innerHTML = '';

        if (data.error) {
          resultadoDiv.innerHTML = `
            <div class="error-message" alert alert-danger>
              <p>${data.error}</p>
              <p>Por favor, verifique el RUT ingresado.</p>
            </div>
          `;
        } else {
          const nombreEmpleado = data.Nombre;
          const apellidosEmpleado = data.Apellidos;
          let imagenEmpleado = data.imagenURL;

          // Verificar si no hay imagen disponible
          if (imagenEmpleado === 'NA' || imagenEmpleado === '') {
            // Asignar la ruta de la imagen por defecto
            imagenEmpleado = 'FrontEnd/static/img/Saludando.png';
          }else{
            resultadoDiv.innerHTML = `
            <div class="empleado-encontrado">
              <img src="${imagenEmpleado}" alt="Imagen del empleado" class="imagen-empleado">
              <div class="info-empleado">
                <h3>Encuestador encontrado:</h3>
                <h2>${nombreEmpleado} ${apellidosEmpleado}</h2>
              </div>
            </div>
          `;
          }

          // Mostrar los proyectos activos y expirados del encuestador
          const proyectosActivos = data.proyectosActivos;
          const proyectosExpirados = data.proyectosExpirados;

          if (proyectosActivos && proyectosActivos.length > 0) {
            resultadoDiv.innerHTML += `
              <h2>Proyectos activos</h2>
              <table>
                <thead>
                  <tr>
                    <th>Nombre Proyecto</th>
                    <th>Fecha Inicio Proyecto</th>
                    <th>Fecha Termino Proyecto</th>
                  </tr>
                </thead>
                <tbody>
                  ${proyectosActivos.map(proyecto => `
                    <tr>
                      <td class="text-center">${proyecto.nombre}</td>
                      <td class="text-center">${new Date(proyecto.fechaInicio).toLocaleDateString()}</td>
                      <td class="text-center">${new Date(proyecto.fechaFin).toLocaleDateString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <hr>
            `;
          } else {
            resultadoDiv.innerHTML += `
              <h5>No se encontraron proyectos activos.</h5>
              <hr>
            `;
          }

          if (proyectosExpirados && proyectosExpirados.length > 0) {
            resultadoDiv.innerHTML += `
              <h2>Proyectos Anteriores</h2>
              <table>
                <thead>
                  <tr>
                    <th>Nombre Proyecto</th>
                    <th>Fecha Inicio Proyecto</th>
                    <th>Fecha Termino Proyecto</th>
                  </tr>
                </thead>
                <tbody>
                  ${proyectosExpirados.map(proyecto => `
                    <tr>
                      <td class="text-center">${proyecto.nombre}</td>
                      <td class="text-center">${new Date(proyecto.fechaInicio).toLocaleDateString()}</td>
                      <td class="text-center">${new Date(proyecto.fechaFin).toLocaleDateString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `;
          } else {
            resultadoDiv.innerHTML += `
              <h5>No ha participado en otros proyectos.</h5>
            `;
          }

          // Mostrar botón para volver atrás
          resultadoDiv.innerHTML += `
            <button class="btn btn-primary" onclick="limpiarBusqueda()">Volver atrás</button>
          `;
        }
      })
      .catch(error => {
        console.error(error);
      });
  }, 500);
}

function limpiarBusqueda() {
  // Limpiar el campo de entrada
  document.getElementById('rut').value = '';

  // Borrar el contenido del resultado
  document.getElementById('resultado').innerHTML = '';
}
