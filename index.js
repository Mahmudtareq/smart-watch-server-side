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
        const orderCollection = database.collection("orders");
        const reviewAllOrder = database.collection("reviews");
        const usersCollection = database.collection("users");

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
        // reviews 
        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            const result = await reviewAllOrder.insertOne(reviews);
            console.log(result)
            res.json(result)

        })
        app.get('/reviews', async (req, res) => {
            const cursor = reviewAllOrder.find({});
            const orders = await cursor.toArray();
            res.json(orders);
            
        })



        // order place
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            // console.log(result)
            res.json(result)
            
        })

        // user show all orders
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            // console.log(query);
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
            
        })
    
        // grt user data 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        // 

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
            
        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const option = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, option);
            res.json(result);

            
        })
        // update user
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            // console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
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