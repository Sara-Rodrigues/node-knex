const crypto = require('crypto');
const connection = require ('../database/connection');

module.exports = {

    // Listando as ongs
    async index (request, response) {
        const ongs = await connection('ongs').select('*');
  
        return response.json(ongs);
    },

    // Criando as ongs
    async create(request, response) {
         // desestruturação p/ pegar os dados de forma separada
    const { name, email, whatsapp, city, uf } =  request.body;

    const id = crypto.randomBytes(4).toString('HEX');

    await connection('ongs').insert({
            id,
            name,
            email,
            whatsapp,
            city,
            uf,
    })
    
    return response.json({ id });
    }
};