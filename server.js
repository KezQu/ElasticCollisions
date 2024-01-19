const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const fs = require("fs");
class Database{
	constructor(dbName){
		try{
			this.url = "mongodb://127.0.0.1:27017/" + dbName;
			this.clientDB = new MongoClient(this.url);
			this.clientDB.connect(); 
		}catch(err){
			throw Error("unable to connect to database " + err);
		}
	}
	async connectCollection(collectionName){
		let collections = await this.clientDB.db().listCollections().toArray();
		if(collections.filter(coll => coll.name === collectionName).length == 0){
			this.clientDB.db().createCollection(collectionName);
		}
	}
	async find(record, collectionName){
		let found_records = await this.clientDB.db().collection(collectionName).find({username : record.username}).toArray();
		if(Object.keys(found_records).length != 0){
			return await found_records;
		}
		else{
			return await null;
		}
	}
	async insert(record, collectionName){
		return await this.clientDB.db().collection(collectionName).insertOne(record);
	}
	async delete(record, collectionName){
		let res = await this.clientDB.db().collection(collectionName).deleteOne(record);
		if(res.deletedCount != 1){
			throw Error("Unable to delete");
		}
	}
}
const SecretKey = 'eouruitcnhu3p95tm3c3hp2n7trng3c4osbcn';

let db;
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./"));

app.post("/delete", authToken,  async (req, res) => {
	try{
		const token = req.headers.authorization.split(" ")[1];
		await db.delete({username : jwt.decode(token), name : req.body.name}, "simulations");
		let saved_sims = await db.find({username : jwt.decode(token)}, "simulations");
		let mess = {
			message : "Simulation deleted successfully",
			data : saved_sims
		};
		res.status(201).send(JSON.stringify(mess));
	}catch(err){
			console.log(err);
			res.status(500).send();
	}
});
app.post("/save", authToken,  async (req, res) => {
	try{
		if(req.body.data.length != 0){
			const token = req.headers.authorization.split(" ")[1];
			req.body.name = new Date().toLocaleString();
			req.body.username = jwt.decode(token);
			await db.insert(req.body, "simulations");
			let saved_sims = await db.find({username : jwt.decode(token)}, "simulations");
			let mess = {
				message : "Simulation saved successfully",
				data : saved_sims
			};
			res.status(201).send(JSON.stringify(mess));
		}else{
			res.status(400).send(JSON.stringify({message : "Cannot save empty simulation", token : req.headers.authorization.split(" ")[1]}));
		}
	}catch(err){
			console.log(err);
			res.status(500).send();
	}
});
app.post("/login", async (req, res) =>{
	try{
		if(db == undefined){
			db = new Database("conservationOfMomentum");
		}
		let user = req.body;
		let found_user = await db.find(user, "users");
		if(found_user != null){
			found_user = found_user[0];
			if(await bcrypt.compare(user.password, found_user.password)){
				const accessToken = jwt.sign(found_user.username, SecretKey);
				let saved_sims = await db.find(user, "simulations");
				res.status(200).send(JSON.stringify({
					session : user.username,
					message : "Successfully logged in",
					data : saved_sims,
					token : accessToken
				}));
			}else{
				res.status(400).send(JSON.stringify({
					message : "Incorrect password"
				}));
			}
		}else{
			res.status(404).send(JSON.stringify({
				message : "User does not exist"
			}));
		}
	}catch(err){
		console.log(err);
		res.status(500).send();
	}
});
app.get("/logout", authToken,  async (req, res) => {
	try{
		let mess = {
			message : "Logout successful",
			token : undefined
		};
		res.status(200).send(JSON.stringify(mess));
	}catch(err){
		console.log(err);
		res.status(500).send();
	}
});
app.post("/register", async (req, res) =>{
	try{
		if(db == undefined){
			db = new Database("conservationOfMomentum");
		}
		let user = req.body;
		let found_user = await db.find(user, "users");
		if(found_user == null){
			user.password = await bcrypt.hash(user.password, 13);
			await db.insert(user, "users");
			res.status(201).send(JSON.stringify({
				message : "Account created successfully"
			}));
		}else{
			res.status(404).send(
				JSON.stringify({
					message : "User with this e-mail already exists"
				}));
		}
	}catch(err){
		console.log(err);
		res.status(500).send();
	}
});
function authToken(req, res, next){
	try{
		const token = req.headers.authorization.split(" ")[1];
		jwt.verify(token, SecretKey, (err, session) =>{
			if(err) return res.status(403).send(err);
			req.session = session;
			next();
		});
	}catch(err){
		throw res.status(401).send(JSON.stringify(err));
	}
}
app.get("/", async (req, res) => {
	try{
		res.status(200).send(await fs.readFile("./index.html", "utf-8"));
	}catch(err){
		res.status(404).send(err);
	}
})

let port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server is running at " + port));