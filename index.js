const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const tokenInfo = req.headers.authorization;

  if (!tokenInfo) {
    return res.status(401).send({ message: "Unouthorize access" });
  }
  const token = tokenInfo.split(" ")[1];
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    } else {
      req.decoded = decoded;
      next();
    }
  });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@nsmobilehouse.r0cka.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const inventoryCollection = client.db("inventory").collection("cars");

    // use jwt
    app.post("/login", (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.SECRET_KEY);
      res.send({ token });
    });

    // add inventory
    app.post("/inventory", verifyJWT, async (req, res) => {
      const newInventory = req.body;
      const result = await inventoryCollection.insertOne(newInventory);
      res.send(result);
    });
  } finally {
    // client.close();
  }
};
