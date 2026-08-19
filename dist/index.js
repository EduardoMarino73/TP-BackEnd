import express from "express";
import { movieRouter } from "./Movie/movie.routes.js";
//levanto el Servidor   
const app = express();
app.use(express.json());
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening at port: ${PORT}`);
});
app.use('/api/movie', movieRouter);
app.use((_, res) => {
    return res.status(404).send({ message: "source not found " });
});
<<<<<<< Updated upstream
=======
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
>>>>>>> Stashed changes
//# sourceMappingURL=index.js.map