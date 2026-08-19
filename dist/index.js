import express from "express";
import { movieRouter } from "./Movie/movie.routes.js";
import cors from "cors";
//levanto el Servidor   
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening at port: ${PORT}`);
});
app.use('/api/movie', movieRouter);
app.use((_, res) => {
    return res.status(404).send({ message: "source not found " });
});
//# sourceMappingURL=index.js.map