const MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;
const GridFS = require('mongodb').GridFSBucket;

class Mongo {

    static instance;
    client;
    db;
    bucket;

    static getInstance(){
        if (!Mongo.instance) Mongo.instance = new Mongo();
        return Mongo.instance;
    }

    async connect(url, dbName){
        this.client = new MongoClient(url, {useUnifiedTopology: true, useNewUrlParser: true});
        await this.client.connect();
        this.db = this.client.db(dbName);
        this.bucket = new GridFS(this.db, {
            chunkSizeBytes: 1024,
            bucketName: 'files'
        });
    }

    async close(){
        await this.client.close();
    }

    async save(collection, doc){
        let opResult = await this.db.collection(collection).insertOne(doc);
        return {
            id: opResult.insertedId,
            result: opResult.result
        };
    }

    async saveMany(collection, data){
        let opResult = await this.db.collection(collection).insertMany(data);
        return {
            status: 'ok'
//            id: opResult.insertedId,
//            result: opResult.result
        };
    }

    async find(collection, query){
        return (await this.db.collection(collection).find(query)).toArray();
    }

    async delete(collection, query){
        await this.db.collection(collection).deleteMany(query);
    }

    async upsert(collection, query, doc){
        await this.db.collection(collection).replaceOne(query, doc, {upsert: true});

    }

    async update(collection, id, value){
        await this.db.collection(collection).updateMany({_id: ObjectID(id)}, {'$set': value});
    }

    async upload(fileName, readStream, metadata){
        return new Promise((resolve, reject) => {
            readStream.pipe(this.bucket.openUploadStream(fileName, {
                metadata
            }))
                .on('error', reject)
                .on('finish', resolve);
        });
    }

    downloadByName(filename){
        return this.bucket.openDownloadStreamByName(filename);
    }

    downloadByID(id){
        return this.bucket.openDownloadStream(new ObjectID(id));
    }
    
    async stats(collection){
        return this.db.collection(collection).stats();
    }

}


module.exports = Mongo;
