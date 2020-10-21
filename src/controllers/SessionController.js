const connection = require("../database/connection");

module.exports = {
    async create(request, response) {
        const { id } = request.body; // buscar o id através do corpo da requisição

        const ong = await connection('ongs')
         .where('id', id)
         .select('name') // selecionar apenas o nome da ong
         .first(); // somente um resultado e não o array inteiro

        
         // se essa ong não existir retornar o erro
         if (!ong) {
             return response.status(400).json({ error: 'No ONG found with this ID'});
         }

         // se tudo deu certo retornar os dados da ong que no caso é só o nome
         return response.json(ong);
    },
}