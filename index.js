const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());


// pawmart-server
// VoGrA742p1zdnzCr

const uri = "mongodb+srv://pawmart-server:VoGrA742p1zdnzCr@cluster0.dmwbpii.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const db = client.db('pawmart-server')
        const pawmartCollection = db.collection('listings')
        const categoryCollection = db.collection('category_filtered_products')
        const petSupplyCollection = db.collection('listings')
        const usersCollection = db.collection('users')

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = req.body.email;
            const query = { email: email }
            const existingUser = await usersCollection.findOne(query);

            if (existingUser) {
                res.send({ message: 'user already exits. do not need to insert again' });
            }
            else {
                const result = await usersCollection.insertOne(newUser);
                res.send(result);
            }
        })

        app.get('/orders', async(req, res) => {
            const email =req.body.email;
            const query = email ? { email } : {};
            res.send(await db.collection('orders').find(query).toArray());
        })

        app.post('/orders', async (req, res) => {
            const newOrder = req.body;
            const result = await db.collection('orders').insertOne(newOrder);
            res.send(result);
        })

        app.post('/listings', async (req, res) => {
            const newListing = req.body;
            const result = await db.collection('listings').insertOne(newListing);
            res.send(result);
        })

        app.delete('/listings/:id', async (req, res) => {
            res.send(await db.collection('listings').deleteOne({ _id: new ObjectId(req.params.id) }));
        })

        app.get('/listings', async (req, res) => {
            const result = await pawmartCollection.find().toArray()
            console.log(result)

            res.send(result)
        });

        app.get('/category-filtered-product/:categoryName', async (req, res) => {
            const categoryName = req.params.categoryName;
            // res.send(result);
            try {
                const products = await categoryCollection.find({ category: categoryName }).toArray();
                res.json(products);
            } catch (error) {
                console.error('Error fetching data:', error);
                res.status(500).json({ message: "Error fetching products", error });
            }
        })

        app.get('/latest-listings', async (req, res) => {
            const cursor = pawmartCollection.find().sort({ date: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/listing-details', async (req, res) => {
            const listingDetails = await pawmartCollection.find().toArray();
            console.log(listingDetails);
            res.send(listingDetails);
        })

        app.get('/listing-details/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) }
            const result = await pawmartCollection.findOne(query);
            res.send(result);
        })

        app.get('/pet-listings', async (req, res) => {
            const petSupply = await petSupplyCollection.find().toArray();
            console.log(petSupply);
            res.send(petSupply);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Pawmart Server is running!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
