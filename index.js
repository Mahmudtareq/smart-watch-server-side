const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());

// database connection 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l1qze.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri);

async function run() {
    try {
        await client.connect();
        // console.log('database connected')
        const database = client.db("smartWatche");
        const productCollection = database.collection("products");
        // get all data
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })
        // get single service
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('product find');
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.json(product);

        })

        // post
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            // console.log(result);
            res.json(result)
            // res.send('post hittet');

        })

        // delete api
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.json(result);


        })


    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World famous Watches')
})

app.listen(port, () => {
    console.log(`localhost:${port}`)
})