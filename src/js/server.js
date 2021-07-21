const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const bodyParser = require('body-parser');
const ObjectID = require('mongodb').ObjectId;

let db;
let app = express();
app.use(express.json());

const url = 'mongodb://localhost:27017';
const dbname = 'weather-app';
const client = new MongoClient(url);

app.get('/', (req, res) => {
    res.send('Hello weather app');
});

app.get('/cities', (req, res) => {
    db.collection('cities').find().toArray((err, docs) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        }
        res.send(docs);
    });
});

app.get('/cities/:id', (req, res) => {
    db.collection('cities').findOne({_id: ObjectID(req.params.id)}, (err, docs) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(docs);
    });
});

app.post('/cities', (req, res) => {
    let city = {
        name: req.body.name
    };

    db.collection('cities').insertOne(city, (err) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        res.send(city);
    });
});

app.put('/cities/:id', (req, res) => {
    db.collection('cities').updateOne({_id: ObjectID(req.params.id)}, 
        {$set: {name: req.body.name}}, (err, result) => {
            if (err) {
                console.log(err);
                return res.sendStatus(500);
            }
            res.sendStatus(200)
        });
});

app.delete('/cities/:id', (req, res) => {
    db.collection('cities').deleteOne({_id: ObjectID(req.params.id)}, (err, docs) => {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(docs);
    });
});

client.connect(err => {
    console.log('connected successfully to server');

    db = client.db(dbname);
    app.listen(3333, () => {
        console.log('server started');
    });
});
