import express from "express";
import multer from "multer";
import cors from 'cors';
import fs from "fs";
//levanto el Servidor   
const app = express();
app.listen(3000, () => {
    console.log("El servidor esta iniciado ");
});
/*objeto donde guardo las configuraciones que utilizo para enviar el contenido a travez de Express*/
const configuracion_envio = { root: "./" };
app.use(cors());
//creo un objeto que sirve como configuracion para almacenar los datos en el disco
const configuracion_almacenamiento = multer.diskStorage({
    /*cuando hago este estilo de cosas, y por cosas me refiero a hacer "nombre de un atributo: function (...) {...}"
    estoy diciendo que el valor de ese atributo se define cuando se resuelve el callback. Se supone que este metodo
    me permite ser mas claro a la hora de pasarle los parametros con los que quiero formar ese atributo */
    destination: function (req, file, cb) {
        /* null significa que no hay error(?¿), mientras que './' indica la ruta en la que quiero que se guarde el
        archivo */
        cb(null, './');
    },
    filename: function (req, file, cb) {
        /*algo similar a lo anterior solo que ahora le estoy nombre que quiero que tengan los archivos. Con esta
        forma evito que se pisen los archivos cuando este haciendo pruebas */
        cb(null, Date.now() + ' ' + file.originalname);
    }
});
/*ahora le doy esa configuracion al objeto que voy a usar para guardar los archivos que reciba */
const almacenamiento = multer({ storage: configuracion_almacenamiento });
/*el metodo "single" un unico archivo asociado a su campo que fue procesado por el middleware.
En caso de necesitar hacer esto con varios archivos al mismo tiempo tenemos que usar el metodo "fields"*/
app.post('/api/videos', almacenamiento.single('contenido'), (req, res) => {
    console.log(req.file?.originalname);
    res.send();
});
/*Siempre que se trabaje con archivos vamos a tener que usar la palabra async para indicar que trabajamos de forma asincrona.
IMPORTANTE acordarse de poner esa palabra clave para no perder media tarde como me paso
atte: Eduardo el 5/5/26 a las 18:17 */
async function listarPeliculas() {
    /*Creo un arreglo vacio donde guardo el nombre de las peliculas que encuentre*/
    let peliculas = new Array;
    /*await indica que voy a esperar que lo que este enfrente termine.
    La promesa me indica que quizas ahora no tenga lo que estoy buscando pero que mas adelante me lo va a entregar */
    const directorio = await fs.promises.opendir("./src/contenido/peliculas");
    /*Recorro el directorio agregando los nombre de las peliculas al arreglo de peliculas */
    for await (const contenido of directorio) {
        peliculas.push(contenido.name);
    }
    /*Devuelvo el arreglo con todas las peliculas que encontre(puede llegar a estar vacio) */
    return peliculas;
}
/*Como estamos enviando el resultado de una funcion funcion asincrona hacemos la arrow function asincrona tambien.
Esto es para evitar tener que manejar la promesa que nos devolveria con el metodo then(parametro => {...}) */
app.get('/contenido/peliculas', async (req, res) => {
    res.send(await listarPeliculas());
});
async function listarSeries() {
    let series = new Array;
    const directorio = await fs.promises.opendir("./src/contenido/series");
    for await (const contenido of directorio) {
        series.push(contenido.name);
    }
    return series;
}
app.get('/contenido/serires', async (req, res) => {
    res.send(listarSeries());
});
//# sourceMappingURL=index.js.map