const express = require('express');
const mongodb = require('mongodb');

const ObjectId = mongodb.ObjectId;
require ("dotenv").config();

(async () => {
    const dbHost = process.env.DB_HOST;
    const dbPort = process.env.DB_PORT;
    const dbName = process.env.DB_NAME;

    const app = express();
    app.use(express.json());
    const port = process.env.PORT || 3000;

    const connectionString = `mongodb://${dbHost}:${dbPort}/${dbName}`;

    const options = {useUnifiedTopology: true};

    const client = await mongodb.MongoClient.connect(connectionString, options);

    const db = client.db("db_rickmorty"); //nome do banco de dados
    const personagens = db.collection("personagens");

    //array com personagens válidos
    const getPersonagensValidos = () => personagens.find({}).toArray();

    //busca individualmente
    const getPersonagensById = async (id) => personagens.findOne({_id: ObjectId(id)});

    
// const { MongoClient } = require('mongodb');
// const uri = "mongodb+srv://dev:121002@cluster0.xfgj7.mongodb.net/Cluster0?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   const collection = client.db("Cluster0").collection("filmes");
//   // perform actions on the collection object
//   client.close();
// });




    app.get('/', (req, res) => {
        res.send({info: "Olá, Blue!"});
    });
    

    app.get('/personagens', async (req, res) => {
        res.send(await getPersonagensValidos());
    })

    app.get('/personagens/:id', async (req, res) => {
        const id = req.params.id;
        const personagem = await getPersonagensById(id);

        res.send(personagem);
    });


    //POST... VERIFICAR A VALIDAÇÃO, INDEPENDENTE DELA ESTÁ FUNCIONANDO
    app.post('/personagens', async (req, res) => {
        const objeto = req.body;
        const {insertCount} = await personagens.insertOne(objeto);


        if (!objeto || !objeto.nome || !objeto.imagemUrl) {
            res.send("Objeto inválido");
            return;
        }

        
        if (insertCount !== 1) {
            res.send("Ocorreu um erro");
            return;
        } 
        res.send(objeto);
        // const {insertedCount} = await personagens;   //inserir objeto dentro do banco, criando variavel dentro da chaves pq estamos inserindo como objeto
    });


    app.put('/personagens/:id', async (req, res) => {
        const id = req.params.id;
        const objeto = req.body;

        res.send(
            await personagens.updateOne(
                {
                    _id: ObjectId(id),
                },
                {
                    $set: objeto,
                }
            )
        );
    });
    //quando se usa updateId precisa passar como parametro o id do bd com o id e seto ele como objeto inteiro


    app.delete('/personagens/:id', async (req, res) => {
        const id = req.params.id;

        res.send(
            await personagens.deleteOne(
                {
                    _id: ObjectId(id),
                }
            )
        );

    })

    

    app.listen(port, () => {
        console.log(`App rodando em http://localhost:${port}`);
    })

})();