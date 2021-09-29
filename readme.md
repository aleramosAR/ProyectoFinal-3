# Desafio 36 / Proyecto Final #3

### Consigna
<br />

* Un menú de registro y autenticación de usuarios basado en passport local, guardando en la base de datos las credenciales y el resto de los datos ingresados al momento del registro.

* El registro de usuario consiste en crear una cuenta en el servidor almacenada en la base de datos, que contenga el email y password de usuario, además de su nombre, dirección, edad, número de teléfono (debe contener todos los prefijos internacionales) y foto ó avatar. La contraseña se almacenará encriptada en la base de datos.

* La imagen se podrá subir al servidor y se guardará en una carpeta pública del mismo a la cual se tenga acceso por url.
<br /><br /><br />

### Resolución
<br />

El login y registro se hacen con passport y los datos son grabados en la tabla **users** de MongoDB Atlas.<br /><br />

Al registrarse se graban 'nombre', 'password', 'email', 'dirección', 'edad' y 'teléfono'.<br />
Al enviar el formulario se genera el **user** y como foto se levanta por defecto, una imagen llamada ``template.jpg``.<br />

En el paso siguiente se sube la foto a la carpeta **/public/assets** y se actualiza el dato del usuario grabando el nombre de la foto en el registro de la base.<br /><br />
Las fotos van en una carpeta pública, por ejemplo esta es la URL de la foto **template.jpg** que se muestra en caso de no subirse ninguna imagen.<br />
https://coder-final-36.herokuapp.com/assets/template.jpg
<br />
<br />
<hr />
<br /><br />

### Consigna
<br />

* Un formulario post de registro y uno de login. De modo que, luego de concretarse cualquiera de estas operaciones en forma exitosa, el usuario accederá a su home.

* El usuario se logueará al sistema con email y password y tendrá acceso a un menú en su vista, a modo de barra de navegación. Esto le permitirá ver los productos totales con los filtros que se hayan implementado y su propio carrito de compras e información propia (datos de registro con la foto). Además, dispondrá de una opción para desloguearse del sistema.

* Ante la incorporación de un usuario, el servidor enviará un email al administrador con todos los datos de registro y asunto 'nuevo registro', a una dirección que se encuentre por el momento almacenada en una constante global.
<br /><br /><br />

### Resolución
<br />
Por defecto el usuario es enviado al form de login al ingresar a la app (en caso de ya estar logueado y tener la sesión activa, sera redireccionado al listado de productos)<br />

https://coder-final-36.herokuapp.com/login
<br /><br />

Desde ahí, por medio de un link puede ir a la página de registro en caso de no poseer una cuenta.

https://coder-final-36.herokuapp.com/register
<br /><br />

Al ingresar, el usuario verá un menu para navegar entre **PRODUCTOS** y **CARRTIO** y debajo un box con sus datos, foto, nombre, telefono, etc. Así como un botón para desloguearse, esto sólo está visible en las paginas internas, en caso de acceder directamente sin estar logueado se redireccionara a una pagina llamada ``/unauthorized`` desde el middleware de validación de sesión.

<br />

Al registrarse un nuevo usuario se envia un email (por medio de nodemailer) a la dirección de email grabada en ``config.js`` con el nombre de **ADMIN_EMAIL**, ahora puse mi dirección pero se puede modificar para recibir en otra.<br />
En el siguiente link adjunto una captura del email que llega al crear un usuario nuevo.

https://coder-final-36.herokuapp.com/docs/registro-mailadmin.jpg


<br />
<br />
<hr />
<br /><br />
  

### Consigna
<br />

* Envío de un email y un mensaje de whatsapp al administrador desde el servidor, a un número de contacto almacenado en una constante global.

* El usuario iniciará la acción de pedido en la vista del carrito.

* Será enviado una vez finalizada la elección para la realizar la compra de productos.

* El email contendrá en su cuerpo la lista completa de productos a comprar y en el asunto la frase 'nuevo pedido de ' y el nombre y email del usuario que los solicitó. En el mensaje de whatsapp se debe enviar la misma información del asunto del email.

* El usuario recibirá un mensaje de texto al número que haya registrado, indicando que su pedido ha sido recibido y se encuentra en proceso.

<br />

### Resolución
<br />
Debajo de la tabla de items del carrito se verá un botón de **COMPRAR** (sólo visible si hay elementos en el carrito)
<br /><br />
Una vez que se hace la compra se borra el carrito de la tabla, ya que los productos ya fueron "vendidos".
La función devuelve un objeto con los datos de la orden, es decir los datos del comprador, la fecha y el listado de productos.
<br /><br />
El controlador recibe estos datos y envía un email (mediante nodemailer) y un whatsapp (mediante twillio) al admin. El email con los datos completos de la compra y el whatsapp solo con el texto "Nueva compra de NOMBRE_COMPRADOR"
<br /><br />
En el siguiente link se puede ver el email que recibe el admin con el detalle de la compra, agregue que ademas muestre el precio final con la suma de los precios de los items comprados.<br /><br />

https://coder-final-36.herokuapp.com/docs/compra-mailadmin.jpg

<br />
<br />
<hr />
<br /><br />
  

## Aspectos a incluir:
<br />

* El servidor trabajará con una base de datos DBaaS (Ej. MongoDB Atlas) y estará preparado para trabajar en forma local o en la nube a través de la plataforma PAAS Heroku.

* Habilitar el modo cluster para el servidor, como opcional a través de una constante global.

* Utilizar alguno de los loggers ya vistos y así reemplazar todos los mensajes a consola por logs eficientes hacia la misma consola. En el caso de errores moderados ó graves el log tendrá además como destino un archivo elegido.

* Realizar una prueba de performance en modo local, con y sin cluster, utilizando Artillery en el endpoint del listado de productos (con el usuario vez logueado). Verificar los resultados.

<br />

### Resolución
<br />

El sitio usa la base de datos **MongoDB Atlas** y esta subido tanto a **Github** como a **Heroku**, corriendo en la siguiente dirección:<br />
https://coder-final-36.herokuapp.com/

Guarde las claves de Twillio, MongoDB, etc. en variables de entorno de **Heroku** para manterner los datos seguros.

<br />

En el archivo ``config.js`` agregué la variable **CLUSTER** para activar/desactivar el modo Cluster, si esta activa se puede chequear el proceso activo desde https://coder-final-36.herokuapp.com/cluster

<br />

Use **Winston** para hacer los logs, use el modo **info** para los logs comunes y **warn** y **error** para los errores.<br />
Los logs de warn y error quedan grabados en la carpeta ``/logs``, en los archivos ``warn.log`` y ``error.log``.

<br />

Cree una ruta llamada ``/productos/log`` que carga la pagina de ``/productos`` pero ejecutando un log al cargarlos, hice la prueba con **Artilery** y en el caso del test con log tardó bastante más en procesar, ejecute las siguientes pruebas:

```
artillery quick --count 50 -n 20 http://localhost:8080/api/productos > artillery_sinlog.txt

artillery quick --count 50 -n 20 http://localhost:8080/api/productos/log > artillery_conlog.txt
```

<br />

Resultados de test con log:<br />
https://coder-final-36.herokuapp.com/docs/artillery_conlog.txt

<br />

Resultados de test sin log:<br />
https://coder-final-36.herokuapp.com/docs/artillery_sinlog.txt