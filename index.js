const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
require('dotenv').config()

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('services'));
app.use(fileUpload());

const user = process.env.USER;
const password = process.env.PASSWORD;
const dbName = process.env.DB_NAME;

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${user}:${password}@cluster0.muwip.mongodb.net/${dbName}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const subjectCollection = client.db(`${dbName}`).collection('subjects');

    app.get('/', (req, res) => {
        res.send('Hello I am your new node js project');
    })

    app.get('/subjects', (req, res) => {
        subjectCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/insert', (req, res) => {
        const file = req.files.file;
        const classNo = req.body.classNo;
        const subjectName = req.body.subjectName;
        const subjectCode = req.body.subjectCode;
        const topic = req.body.topic;
        const type = req.body.type;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const img = {
            contextType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        }

        subjectCollection.insertOne({ classNo, subjectName, subjectCode, topic, type, img })
            .then(result => {
                res.send(result.insertedCount > 0)
            })

    })

});


app.listen(process.env.PORT || 5000);  