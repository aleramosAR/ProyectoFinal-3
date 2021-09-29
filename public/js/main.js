const socket = io.connect();
const getUrl = window.location;
const baseUrl = getUrl.protocol + "//" + getUrl.host;
const errormsg = "Hubo un problema con la petición Fetch: ";
// const URL_BASE = 'http://localhost:8080';
const URL_BASE = 'https://coder-final-36.herokuapp.com';

function clickDesloguear() {
  window.location.replace("/logout");
  return false;
}


// Al agregar productos recibo el evento 'listProducts' desde el server y actualizo el template
// Para ver los cambios en la tabla
socket.on('listProducts', async (data) => {
  const { productos, admin } = data;
  const archivo = await fetch('plantillas/listado.hbs');
  const archivoData = await archivo.text();
  const template = Handlebars.compile(archivoData);
  const result = template({productos, admin});
  document.getElementById('productos').innerHTML = result;
});

socket.on('listCarrito', async (data) => {
  const { carrito, admin } = data;
  const archivo = await fetch('plantillas/tabla.hbs');
  const archivoData = await archivo.text();
  const template = Handlebars.compile(archivoData);
  const result = template({carrito, admin});
  document.getElementById('tabla').innerHTML = result;
});

const clickFiltrarProductos = () => {
  const active = $(".list-group-item.active").attr("id");
  let filter = null;
  switch (active) {
    case "l-no":
      if (filNombre.value == "") {
        filter = null;
      } else {
        filter = `nombre=${filNombre.value}`
      }
      break;
    case "l-co":
      if (filCodigo.value == "") {
        filter = null;
      } else {
        filter = `codigo=${filCodigo.value}`
      }
      break;
    case "l-pr":
      if (filPrecioMin.value == "" || filPrecioMax.value == "") {
        filter = null;
      } else {
        filter = `premin=${filPrecioMin.value}&premax=${filPrecioMax.value}`
      }
      break;
    case "l-st":
      if (filStockMin.value == "" || filStockMax.value == "") {
        filter = null;
      } else {
        filter = `stkmin=${filStockMin.value}&stkmax=${filStockMax.value}`
      }
      break;
    default:
      alert('Elegir algun filtro de busqueda.');
  }

  const query = filter ? `${baseUrl}/api/productos?${filter}` : `${baseUrl}/api/productos`;
  cargarDatos(query)
  .then(data => {
    socket.emit('filterProducts', { productos: data });
  }).catch(error => {
    console.log(errormsg + error.message);
  });

  return false;
}

const clickQuitarFiltros = () => {
  cargarDatos(`${baseUrl}/api/productos`)
  .then(data => {

    filNombre.value = "";
    filCodigo.value = "";
    filPrecioMin.value = "0";
    filPrecioMax.value = "1000";
    filStockMin.value = "0";
    filStockMax.value = "100";
    
    socket.emit('filterProducts', { productos: data });
  }).catch(error => {
    console.log(errormsg + error.message);
  });
}


// Funcion para hacer el POST de datos
const cargarDatos = async(url = '') => {
  const response = await fetch(url);
  return response.json();
}


// Callback del boton submit, chequea que el form este completo y llama a la API
// Si todo esta bien emite el evento 'postProduct' al Websocket avisando que se agrego un producto nuevo
const crearProducto = () => {
  if (nombre.value == '' || descripcion.value == '' || precio.value == '' || foto.value == '' || codigo.value == '' || stock.value == '') {
    alert('Por favor llena el formulario.')
  } else {
    const newProd = {
      "nombre": nombre.value,
      "descripcion": descripcion.value,
      "precio": precio.value,
      "foto": foto.value,
      "codigo": codigo.value,
      "stock": stock.value
    };
    enviarDatos(`${baseUrl}/api/productos`, newProd, 'POST')
    .then(() => {
      nombre.value = "";
      descripcion.value = "";
      precio.value = "";
      foto.value = "";
      codigo.value = "";
      stock.value = "";
      socket.emit('postProduct');
    }).catch(error => {
      console.log(errormsg + error.message);
    });
  }
  return false;
}

const actualizarProducto = (id) => {
  if (nombre.value == '' || descripcion.value == '' || precio.value == '' || foto.value == '' || codigo.value == '' || stock.value == '') {
    alert('Por favor llena el formulario.')
  } else {
    const newProd = {
      "nombre": nombre.value,
      "descripcion": descripcion.value,
      "precio": precio.value,
      "foto": foto.value,
      "codigo": codigo.value,
      "stock": stock.value
    };
    enviarDatos(`${baseUrl}/api/productos/actualizar/${id}`, newProd, 'PUT')
    .then(() => {
      window.location.replace("/productos");
    }).catch(error => {
      console.log(errormsg + error.message);
    });
  }
  return false;
}

// Funcion para hacer el POST de datos
const enviarDatos = async(url = '', data = {}, metodo) => {
  const response = await fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}

const clickDelete = (id) => {
  prodDelete(`${baseUrl}/api/productos/borrar/${id}`)
  .then(() => {
    socket.emit('removeProduct');
  }).catch(error => {
    console.log(errormsg + error.message);
  });
  return false;
}

// Funcion para hacer el DELETE de producto
const prodDelete = async(url = '', id = {}) => {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

const clickAgregarCarrito = (id) => {
  prodAgregarCarrito(`${baseUrl}/api/carrito/agregar/${id}`)
  .then(() => {
    location.href = '/carrito';
  }).catch(error => {
    console.log(errormsg + error.message);
  });
  return false;
}

// Funcion para hacer el DELETE de producto
const prodAgregarCarrito = async(url = '', id = {}) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

const clickDeleteCarrito = (id) => {
  prodDeleteCarrito(`${baseUrl}/api/carrito/borrar/${id}`)
  .then(() => {
    socket.emit('removeCarritoProduct');
  }).catch(error => {
    console.log(errormsg + error.message);
  });
  return false;
}

// Funcion para hacer el DELETE de producto
const prodDeleteCarrito = async(url = '', id = {}) => {
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

// Click de COMPRAR el el carrito
const clickComprar = async() => {
  await fetch(`${baseUrl}/comprar`);
}


async function destroySession() {
  try {
    const res = await fetch(`${URL_BASE}/api/auth/logout`);
    if (res.status == 200) {
      redirectLogin();
    } else {
      alert("Hubo un problema al cerrar sesion.")
    }
  } catch (err) {
    alert(err)
  }
}

function redirectLogin() {
  setTimeout(function() {
    window.location.replace("/login");
  }, 2000);
}