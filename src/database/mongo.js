const db = require("mongodb/lib/operations/command");
const MongoClient = require('mongodb').MongoClient;

class Mongo {

    static instance;
    client;
    db;

    static getInstance(){
        if (!Mongo.instance) Mongo.instance = new Mongo();
        return Mongo.instance;
    }

    async connect(url, dbName){
        this.client = new MongoClient(url, {useUnifiedTopology: true, useNewUrlParser: true});
        await this.client.connect();
        this.db = this.client.db(dbName);
    }

    async close(){
        await this.client.close();
    }

    async save(collection, doc){
        await this.db.collection(collection).insertOne(doc);
    }

    async saveMany(collection, data){
        await this.db.collection(collection).insertMany(data);
    }

    async find(collection, query){
        return this.db.collection(collection).find(query).toArray();
    }

    async delete(collection, query){
        await this.db.collection(collection).deleteMany(query);
    }

    async update(collection, query, doc){
        await this.db.collection(collection).replaceOne(query, doc, {upsert: true});
    }
}


module.exports = Mongo;
