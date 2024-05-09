const express = require('express')
const app = express()
const cors = require('cors');
// use cokiparser jot
const jwt = require('jsonwebtoken');
const cookiparser = require('cookie-parser');

require('dotenv').config()
const port = process.env.PORT || 5000

// care-doctor
// SdjYiegAefI5WIeb

app.use(cors({
    origin: [
        'http://localhost:5173'
    ],
    credentials: true
}));
app.use(express.json())
app.use(cookiparser())

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
        const informationColuction = client.db('product').collection('contactinfo')

        // jwt post all

        app.post('/jwt', (req, res) => {
            const user = req.body;
            console.log('cookiss', req.cookies);
            console.log('token', user);
            const token = jwt.sign(user, process.env.DB_TOKEN, {
                expiresIn: "360d"
            })
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            })
                .send({ success: true })
        })

        // loger

        const loger = (req, res, next) => {
            next()
        }
        const varification = (req, res, next) => {
            const token = req?.cookies?.token;
            if(!token){
                return res.status(401).send({message:"unAutorize"})
            }
           jwt.verify(token, process.env.DB_TOKEN , (err,decode)=>{
            if(err){
                return res.status(401).send({message:'UnAutorize'})
            }
            req.user(decode)
            next()
           })
        }

        // clear cocee

        app.post('/logout', (req, res) => {
            const user = req.body;
            console.log("clear token", user);
            res.clearCookie('token', { maxAge: 0 }).send({ success: true })
        })

        // contact info

        app.post('/contact', async (req, res) => {
            const data = req.body;
            const findData = await informationColuction.insertOne(data);
            res.send(findData)
        })

        app.get('/contact', loger, async (req, res) => {
            if(req.user.email !== req.query.email){
                return res.status(403).send({message:"forbeden"})
            }
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await informationColuction.find(query).toArray();
            res.send(result)

        })

        app.get('/contact', async (req, res) => {
            const result = await informationColuction.find().toArray();
            res.send(result)
        })

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

        app.get('/productCount', async (req, res) => {
            const count = await productColoctin.estimatedDocumentCount();
            res.send({ count })
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