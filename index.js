const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;


const app = express();
const cors = require('cors')
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bnebi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//middleware
app.use(cors());
app.use(express.json());



async function run(){
    try{
        await client.connect();
        const db = client.db("travle_agency");
        const service_collection = db.collection("services");
        const order_collection = db.collection("order");

        //Get all service API
        app.get('/services', async(req, res) => {
            const cursor = service_collection.find();
            const services = await cursor.toArray();
            res.json(services);
        });

        //Get single service API
        app.get('/services/:id', async(req, res) => {
            const query = {_id: ObjectId(req.params.id)};
            const service = await service_collection.findOne(query);
            res.json(service);
        });

        //Get many service API
        app.get('/services/myorder/:sid', async(req, res) => {
            const arrayData = JSON.parse(req.params.sid);
            const data = arrayData.map(d => ObjectId(d));
            const service = await service_collection.find({'_id': { $in: data}}).toArray();
            res.json(service);
        });

        //Update API
        app.put('/services/:id', async(req, res) => {

            const updateData = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                  title: updateData.title,
                  price: updateData.price,
                  image: updateData.image,
                  shortDis: updateData.shortDis
                },
              };

            const filter = {_id: ObjectId(req.params.id)};
            const update = await service_collection.updateOne(filter, updateDoc, options );
            res.send(update);
        });

        //delete service API
        app.delete('/services/:id', async(req, res) => {
            const query = {_id: ObjectId(req.params.id)};
            const result = await service_collection.deleteOne(query);
            res.send(result);
        });

        //POST service API
        app.post('/services', async(req, res) => {
            const addservice = req.body;
            const result = await service_collection.insertOne(addservice);
            res.send(result);
        });

        //POST order API
        app.post('/order', async(req, res) => {
            const addservice = req.body;
            const result = await order_collection.insertOne(addservice);
            res.send(result);
        });

        //Get all service API
        app.get('/order', async(req, res) => {
            const cursor = order_collection.find();
            const order = await cursor.toArray();
            res.send(order);
        });
        
        //Get all service API
        app.get('/order/:email', async(req, res) => {
            const query = {email: req.params.email}
            const cursor = order_collection.find(query);
            const myServices = await cursor.toArray();
            res.json(myServices);
        });

        
        //delete order API
        app.delete('/order/:id', async(req, res) => {
            const query = {serviceId: req.params.id };
            console.log('hitted delete');
            const result = await order_collection.deleteOne(query);
            res.send(result);
        });

        //Update API
        app.put('/order/:id', async(req, res) => {
            const updateData = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                  status: updateData.status
                },
              };

            const filter = {_id: ObjectId(req.params.id)};
            const update = await order_collection.updateOne(filter, updateDoc, options );
            res.send(update);
        });

    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})