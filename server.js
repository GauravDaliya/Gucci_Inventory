const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
var db;

const url = 'mongodb://localhost:27017';
const dbName = 'inventory';
MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
    if (err) return console.log(err);
    db = client.db(dbName);
    app.listen(8080, () => {
        console.log("Listening to port #8080")
    })
    console.log(`Connected Database: ${url}`);
    console.log(`Database: ${dbName}`);
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    db.collection('Gucci').find().toArray((err, result) => {
        if (err) return console.log(err);
        res.render('homepage.ejs', { data: result });
    });
});

app.get('/create', (req, res) => {
    res.render('add.ejs');
});

app.get('/updatestock', (req, res) => {
    res.render('update.ejs');
});

app.get('/deletestock', (req, res) => {
    res.render('delete.ejs');
});


app.post('/addData', (req, res) => {
    db.collection('Gucci').save(req.body, (err, result) => {
        if (err) return console.log(err);
        res.redirect('/');
    });
});

app.post('/deleteData', (req, res) => {
    db.collection('Gucci').find().toArray((err, result) => {
        if (err) return console.log(err);
        for (var i = 0; i < result.length; i++) {
            if (result[i].pid == req.body.pid) {
                prevStock = result[i].stock;
                break;
            }
        }
        db.collection('Gucci').deleteOne({ pid: req.body.pid }, (err, result) => {
            if (err) return res.send(err);
            console.log(req.body.pid + "Stock Deleted");
            res.redirect('/');
        });
    });
});

var prevStock;
var flag = 0;
app.post('/updateData', (req, res) => {
    db.collection('Gucci').find().toArray((err, result) => {
        if (err) return console.log(err);
        for (var i = 0; i < result.length; i++) {
            if (result[i].pid == req.body.pid) {
                prevStock = result[i].stock; flag = 1;
                break;
            }
        }
        if (flag == 0) {
            res.redirect('/');
            return console.log("Please Enter Correct Product Id");
        }
        db.collection('Gucci').findOneAndUpdate({ pid: req.body.pid },
            { $set: { stock: parseInt(prevStock) + parseInt(req.body.stock) } }, { sort: { pid: -1 } }, (err, result) => {
                if (err) return res.send(err);
                console.log(req.body.pid + "Stock Updated");
                res.redirect('/');
            });
    });
});
