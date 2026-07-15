import express from "express";
import multer from "multer";
import cors from 'cors';
import fs from "fs";
import { movieRouter } from "./Movie/movie.routes.js";
//levanto el Servidor   
const app = express();
app.listen(3000, () => {
    console.log("El servidor esta iniciado ");
});
app.use('./src/peliculas', movieRouter);
const raiz = "./src";
app.use(cors());
app.use('contenido/peliculas', express.static(raiz + 'contenido/peliculas'));
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
/*Uso de funciones de alto orden */
function listarContenido() {
    /*Devolvemos la plantilla de una funcion */
    return async function (ruta) {
        /*Abrimos el directorio que le pasamos por parametro */
        const directorio = await fs.promises.opendir(ruta);
        let obejtos = new Array;
        /*Recorremos el directorio agregando el nombre de los archivos o carpetas que hay dentro de el */
        for await (const objeto of directorio) {
            obejtos.push(objeto.name);
        }
        /*Retornamos el arreglo con el nombre de lo que hay dentro */
        return obejtos;
    };
}
/*Como estamos enviando el resultado de una funcion funcion asincrona hacemos la arrow function asincrona tambien.
Esto es para evitar tener que manejar la promesa que nos devolveria con el metodo then(parametro => {...}) */
app.get('/contenido/peliculas', async (req, res) => {
    //Armamos la ruta del directorio que vamos a recorrer
    const ruta = raiz + "/contenido/peliculas";
    //guardamos la funcion que creamos con la plantilla
    const contenido = listarContenido();
    //llamamos a la funcion plantilla y enviamos el arreglo que nos devuelve
    res.send(await contenido(ruta));
});
app.get('/contenido/series', async (req, res) => {
    //Armamos la ruta del directorio que vamos a recorrer
    const ruta = raiz + "/contenido/series";
    //guardamos la funcion que creamos con la plantilla
    const contenido = listarContenido();
    //llamamos a la funcion plantilla y enviamos el arreglo que nos devuelve
    res.send(await contenido(ruta));
});
//# sourceMappingURL=index.js.map