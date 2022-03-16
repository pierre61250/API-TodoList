import mongodb from 'mongodb';
import { colours } from '../library/colors.js';

export class db {

    constructor() {
        console.log(`[${new Date().toLocaleTimeString()}] [INFO] Connection to db...`);
        this.MongoClient = mongodb.MongoClient;
        this.url = "mongodb://root:example@127.0.0.1:27017/";
        this.MongoClient.connect(this.url, function(err, db) {
            if (err) throw err;
            console.log(`[${new Date().toLocaleTimeString()}] [${colours.fg.green}SUCCESS${colours.fg.white}] Connection to db is OK !!!`);
            db.close();
        });
    }

    async getTodoList() {
        try {
            let db = await this.MongoClient.connect(this.url);
            let dbo = db.db("api");
            let results = await dbo.collection("todo").find().sort({limitDate:-1}).toArray();
            db.close();
            return results;
        } catch (err) {
            throw err;
        }
    }

    async getTodo(id){
        try {
            let db = await this.MongoClient.connect(this.url);
            let dbo = db.db("api");
            let results = await dbo.collection("todo").find({_id: id}).toArray();
            db.close();
            return results;
        } catch (err) {
            throw err;
        }
    }

    async postTodo(todo) {
        try {
            let db = await this.MongoClient.connect(this.url);
            let dbo = db.db("api");
            await dbo.collection("todo").insertOne(todo);
            return db.close();
        } catch (err) {
            throw err;
        }
    }

    async deleteTodo(id) {
        try {
            let db = await this.MongoClient.connect(this.url);
            let dbo = db.db("api");
            let response = await dbo.collection("todo").deleteOne({_id: id});
            db.close();
            return response;
        } catch (err) {
            throw err;
        }
    }

    async putTodo(todo) {
        try {
            let db = await this.MongoClient.connect(this.url);
            let dbo = db.db("api");
            let response = await dbo.collection("todo").updateOne({_id: todo._id}, {$set:{content: todo.content, limitDate: todo.limitDate, extraInfo: todo.extraInfo}});
            db.close();
            return response;
        } catch (err) {
            throw err;
        }
    }

}