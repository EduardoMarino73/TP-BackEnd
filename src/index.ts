import express from "express";
import multer from "multer";

//levanto el Servidor   
const app = express()
app.listen(3000,() =>{
    console.log("El servidor esta iniciado ")
})

app.use('/',(req,res) =>{
    res.send('Hola Mundo')
})

//creo un objeto que sirve como configuracion para almacenar los datos en el disco
const configuracion_almacenamiento = multer.diskStorage({

    /*cuando hago este estilo de cosas, y por cosas me refiero a hacer "nombre de un atributo: function (...) {...}"
    estoy diciendo que el valor de ese atributo se define cuando se resuelve el callback. Se supone que este metodo
    me permite ser mas claro a la hora de pasarle los parametros con los que quiero formar ese atributo */
    destination: function (req, file,cb) {

        /* null significa que no hay error(?¿), mientras que './' indica la ruta en la que quiero que se guarde el 
        archivo */
        cb(null, './')
    },
    filename:function (req, file, cb) {
        /*algo similar a lo anterior solo que ahora le estoy nombre que quiero que tengan los archivos. Con esta 
        forma evito que se pisen los archivos cuando este haciendo pruebas */
        cb(null, file.filename + ' ' + Date.now())
    }
})

/*ahora le doy esa configuracion al objeto que voy a usar para guardar los archivos que reciba */
const almacenamiento = multer({storage: configuracion_almacenamiento})