/*episodio.repositorio es el DAO.
Se va a encargar de buscar o guardar los episodios con los que tenga que trabajar*/
export class EpisodieRepository {
    /*De forma analoga hacemos lo mismo que en el repositorio de peliculas, definiendo el comportamiento
    especifico de los metodos generales que obtengo del contrato de la interfaz */
    async findAll() {
        throw new Error("Method not implemented.");
    }
    async findOne(item) {
        throw new Error("Method not implemented.");
    }
    async create(item) {
        throw new Error("Method not implemented.");
    }
    async update(item) {
        throw new Error("Method not implemented.");
    }
    async delete(item) {
        return; /*remember fix this */
    }
}
//# sourceMappingURL=episode.repository.js.map