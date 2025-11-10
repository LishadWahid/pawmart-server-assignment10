const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express());


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
