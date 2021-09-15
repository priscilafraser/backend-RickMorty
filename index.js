const express = require('express');
const mongodb = require('mongodb');

const ObjectId = mongodb.ObjectId;
require ("dotenv").config();

(async () => {
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const dbName = process.env.DB_NAME;
    const dbChar = process.env.DB_CHAR;


    const app = express();
    app.use(express.json());
    const port = process.env.PORT || 3000;

    //const connectionString = `mongodb://${dbHost}:${dbPort}/${dbName}`;
    //const connectionString = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.${dbChar}.mongodb.net/${dbName}?retryWrites=true&w=majority`;
    const connectionString = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.${dbChar}.mongodb.net/${dbName}?retryWrites=true&w=majority`;


    const options = {useUnifiedTopology: true};

    const client = await mongodb.MongoClient.connect(connectionString, options);

    const db = client.db("db_rickmorty"); //nome do banco de dados
    const personagens = db.collection("personagens");

    //array com personagens válidos
    const getPersonagensValidos = () => personagens.find({}).toArray();

    //busca individualmente
    const getPersonagensById = async (id) => personagens.findOne({_id: ObjectId(id)});


    // CORS (Cross Origin Resource) Aplica a todas as rotas criadas essas permissoes abaixo, seja de método e protege nosso backend
    app.all("/*", (req, res, next) => {
		res.header("Access-Control-Allow-Origin", "*");

		res.header("Access-Control-Allow-Methods", "*");

		res.header(
			"Access-Control-Allow-Headers",
			"Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization"
		);

		next();
	});


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
        
        if (!objeto || !objeto.nome || !objeto.imagemUrl) {
            res.send("Objeto inválido");
            return;
        }

        const result = await personagens.insertOne(objeto);

        
        if (result.acknowledged == false) {
            res.send("Ocorreu um erro");
            return;
        } 

        res.send(objeto);
        // const {insertedCount} = await personagens;   //inserir objeto dentro do banco, criando variavel dentro da chaves pq estamos inserindo como objeto
    });


    app.put('/personagens/:id', async (req, res) => {
        const id = req.params.id;
        const objeto = req.body;


        if (!objeto || !objeto.nome || !objeto.imagemUrl) {
            res.send({message: "Requisição inválida"});
            return;
        };


        const quantidadeDePersonagens = await personagens.countDocuments({
            _id: ObjectId(id)
        });

        if (quantidadeDePersonagens !== 1){
            res.send("Personagem não encontrado");
            return;
        };

        const result = await personagens.updateOne(
            {
                _id: ObjectId(id),
            },
            {
                $set: objeto,
            }
        );

        if (result.modifiedCount !== 1){
            res.send("ocorreu um erro ao atualizar o personagem");
            return;
        };
        res.send(await getPersonagensById(id));

    });
    //quando se usa updateId precisa passar como parametro o id do bd com o id e seto ele como objeto inteiro


    app.delete('/personagens/:id', async (req, res) => {
        const id = req.params.id;

        const quantidadeDePersonagens = await personagens.countDocuments({
            _id: ObjectId(id),
        })

        if (quantidadeDePersonagens !==1) {
            res.send("personagem não encontrado")
        }

        const result = await personagens.deleteOne({
            _id: ObjectId(id),
        });

        if (result.deletedCount !== 1) {
            res.send("Ocorreu um erro ao deletar o personagem");
            return;
        };

        res.send("Personagem removido com sucesso");

    })

    

    app.listen(port, () => {
        console.log(`App rodando em http://localhost:${port}`);
    })

})();