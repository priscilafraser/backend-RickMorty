const express = require('express');
const mongodb = require('mongodb');

const ObjectId = mongodb.ObjectId;

(async () => {
    const app = express();
    app.use(express.json());
    const port = 28017;

    // const connectionString = `mongodb+srv://dev:121002@cluster0.xfgj7.mongodb.net/Cluster0?retryWrites=true&w=majority`;

    
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://dev:121002@cluster0.xfgj7.mongodb.net/Cluster0?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("Cluster0").collection("filmes");
  // perform actions on the collection object
  client.close();
});


    // const options = {useUnifiedTopology: true};

    // const client = await mongodb.MongoClient.connect(connectionString, options);

    const db = client.db("Cluster0"); //nome do banco de dados
    const personagens = db.collection("filmes");

    //array com personagens válidos
    const getPersonagensValidas = () => personagens.find({}.toArray());

    //busca individualmente
    const getPersonagemById = async (id) => personagens.findOne({_id: ObjectId(id)});
        

    app.get('/', (req, res) => {
        res.send("Olá, Blue!");
    });
    

    app.get('/personagens', async (req, res) => {
        res.send(await getPersonagensValidas());
    })


    app.listen(port, () => {
        console.log(`App rodando em http://localhost:${port}`);
    })

})();