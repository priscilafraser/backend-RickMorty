const express = require("express");
const mongodb = require("mongodb");

const ObjectId = mongodb.ObjectId;
require("dotenv").config();

require("express-async-errors");
var cors = require("cors");

(async () => {
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME;
  const dbChar = process.env.DB_CHAR;

  const app = express();
  app.use(express.json());
  const port = process.env.PORT || 3000;

  const connectionString = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.${dbChar}.mongodb.net/${dbName}?retryWrites=true&w=majority`;

  const options = { useUnifiedTopology: true };

  const client = await mongodb.MongoClient.connect(connectionString, options);

  const db = client.db("db_rickmorty"); //nome do banco de dados
  const personagens = db.collection("personagens");

  //array com personagens válidos
  const getPersonagensValidos = () => personagens.find({}).toArray();

  //busca individualmente
  const getPersonagensById = async (id) =>
    personagens.findOne({ _id: ObjectId(id) });

  // CORS
  app.use(cors());
  app.options("*", cors());

  app.get("/", async (req, res) => {
    res.send({ info: "Olá, Blue!" });
  });

  app.get("/personagens", async (req, res) => {
    res.json(await getPersonagensValidos());
  });

  app.get("/personagens/:id", async (req, res) => {
    const id = req.params.id;
    const personagem = await getPersonagensById(id);

    if (!personagem) {
      res.status(404).send({ error: "Personagem com este id não encontrado" });
      return;
    }

    res.send(personagem);
  });

  //POST... VERIFICAR A VALIDAÇÃO, INDEPENDENTE DELA ESTÁ FUNCIONANDO
  app.post("/personagens", async (req, res) => {
    const objeto = req.body;

    if (!objeto || !objeto.nome || !objeto.imagemUrl) {
      res.status(400).send({
        error:
          "Requisição inválida, certifique-se que todos os campos estejam preenchidos",
      });
      return;
    }

    const result = await personagens.insertOne(objeto);

    // Mostra algum erro com o mongodb... erro de servidor
    if (result.acknowledged == false) {
      res.status(500).send({ error: "Ocorreu um erro" });
      return;
    }

    res.status(201).send(objeto); //status de criado
    // const {insertedCount} = await personagens;   //inserir objeto dentro do banco, criando variavel dentro da chaves pq estamos inserindo como objeto
  });

  app.put("/personagens/:id", async (req, res) => {
    const id = req.params.id;
    const objeto = req.body;

    if (!objeto || !objeto.nome || !objeto.imagemUrl) {
      res.status(400).send({ error: "Requisição inválida" });
      return;
    }

    const quantidadeDePersonagens = await personagens.countDocuments({
      _id: ObjectId(id),
    });

    if (quantidadeDePersonagens !== 1) {
      res.status(404).send({ error: "Personagem não encontrado" });
      return;
    }

    const result = await personagens.updateOne(
      {
        _id: ObjectId(id),
      },
      {
        $set: objeto,
      }
    );

    if (result.acknowledged == "undefined") {
      res
        .status(500)
        .send({ error: "ocorreu um erro ao atualizar o personagem" });
      return;
    }
    res.send(await getPersonagensById(id));
  });
  //quando se usa updateId precisa passar como parametro o id do bd com o id e seto ele como objeto inteiro

  app.delete("/personagens/:id", async (req, res) => {
    const id = req.params.id;

    const quantidadeDePersonagens = await personagens.countDocuments({
      _id: ObjectId(id),
    });

    if (quantidadeDePersonagens !== 1) {
      res.status(404).send({ error: "Personagem não encontrado" });
      return;
    }

    const result = await personagens.deleteOne({
      _id: ObjectId(id),
    });

    // Se não deletar, erro no mongo
    if (result.deletedCount !== 1) {
      res
        .status(500)
        .send({ error: "Ocorreu um erro ao deletar o personagem" });
      return;
    }

    res.sendStatus(204); //quando faz delete não precisa retornar mensagem, somente status, daí coloca o status direto no send
  });

  // Central de tratamento de erros

  //midleware -> Tratamento de rotas
  app.all("*", function (req, res) {
    res.status(404).send({ message: "Endpoint was not found" });
  });

  //middleware -> Tratamento de erro no geral
  app.use((error, req, res, next) => {
    res.status(error.status || 500).send({
      error: {
        status: error.status || 500,
        message: error.message || "Internal Server Error",
      },
    });
  });

  app.listen(port, () => {
    console.log(`App rodando em http://localhost:${port}`);
  });
})();
