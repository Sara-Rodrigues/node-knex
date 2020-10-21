const { request } = require("express");
const { create, index } = require("./OngController");

const connection = require('../database/connection');
    
module.exports = {
    async index(request, response) {
        const { page = 1 } = request.query; 
        // buscando de dentro do resquest query um paramentro chamado page

        const [count] = await connection('incidents').count(); // query criada a parte q serve para contar a quantidade de incidents

        const incidents =  await connection('incidents')
        // join serve para relacionar dados de duas tabelas
        // por exemplo aqui trazendo os dados da tabelas de ongs comparando se o id da ong é igual ao do incident
        .join('ongs', 'ongs.id', '=', 'incidents.ong_id')   
        .limit(5) // limitar os dados da busca para apenas 5 incidents
        .offset((page - 1) * 5) // pular cinco registros por página
        // quero todos os dados da tabela incidents, porém na da ong selecionando os dados que eu quero
        .select([
            'incidents.*', 
            'ongs.name', 
            'ongs.email',
            'ongs.whatsapp',
            'ongs.city',
            'ongs.uf'
        ]); 

        response.header('X-Total-Count', count['count(*)']); // resposta vindo do cabeçalho da requisição p/ o front end saber o total de registros

        return response.json(incidents);
    },

    async create(request, response) {
        const { title, description, value } = request.body;
        const ong_id = request.headers.authorization; // autenticação fica geralmente no headers cabeçalho da requisição

        // desestruturado para pegar o 1° chave desse array para pegar o id gerado no cadastro
        const [id] = await connection('incidents').insert({
            title,
            description,
            value,
            ong_id,
        });

        return response.json({ id })
    },

    async delete(request, response) {
        const { id } = request.params;
        // buscando o id da ong para verificar se o incident foi criado pela ong q quer deletar
        const ong_id = request.headers.authorization;

        const incident = await connection('incidents')
        .where('id', id) // buscar um incident onde o a const id for igual a id
        .select('ong_id') // apenas a coluna de id
        .first(); // retorna apenas 1 resultando

        // verifica se o ong_id que buscamos no banco é diferente do ong_id que está logado e retorna um erro
        if (incident.ong_id !== ong_id ) {
            return response.status(401).json({ error: 'Operation not permitted' }); // retorna um json com o protocolo http 401
        }

        // se deu tudo certo na tabela incidents, deleta o id
        await connection('incidents').where('id', id).delete();

        return response.status(204).send(); // retorna um resposta pro front que deu sucesso, mas sem conteudo
    },
};