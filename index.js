const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000

// care-doctor
// SdjYiegAefI5WIeb

app.use(cors());
app.use(express.json())

console.log(process.env.DB_USER)

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@atlascluster.aasa6jh.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster`;
// const uri = "mongodb+srv://<username>:<password>@atlascluster.aasa6jh.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const productColoctin = client.db('product').collection('allproduct');

        app.get('/allProduct', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const carsor = productColoctin.find();
            const result = await carsor
            .skip(page * size)
            .limit(size)
            .toArray()
            
            res.send(result)

            // const product = productColoctin.find().toArray();
            // res.send(product)
        })

        app.get('/productCount', async(req, res)=>{
            const count = await productColoctin.estimatedDocumentCount();
            res.send({count})
        })

        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})