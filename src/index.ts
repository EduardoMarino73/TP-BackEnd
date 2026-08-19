import express from "express";
import { movieRouter } from "./Movie/movie.routes.js";
import cors from "cors";
import path from "path";

//levanto el Servidor   
const app = express()
app.use(cors());
app.use(express.json());
app.use("/movies", express.static(path.resolve("src/Shared/database/content/movies")));

const PORT = 3000

app.listen(PORT,() =>{
    console.log(`Server listening at port: ${PORT}`);
})

app.use('/api/movie',movieRouter)

app.use((_,res) => {
    return res.status(404).send({message: "source not found "});
})


