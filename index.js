import express from "express";
import bodyParser from "body-parser";
import pg from 'pg'
import 'dotenv/config'

const app = express();
const port = 3000;



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const pgdb = new pg.Client({
  user: process.env.PgUser,
  host: process.env.PgHost,
  database: process.env.PgDatabase,
  password: process.env.PGPASSWORD,
  port: process.env.PGport,
})

pgdb.connect();

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
  { id: 3, title: "หีแตด" }
];


async function selectedItems() {
  const result = await pgdb.query("select * from items")
  const items = result.rows
  return items
}

app.get("/", async (req, res) => {
  const items = await selectedItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});


app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  console.log(item)
  try {
    await pgdb.query(
      "INSERT INTO items (title) VALUES ($1)",
      [item]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
    const items = await selectedItems();
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
      error: "Something when wrong when you add new Data",
    });
  }
});


app.post("/edit", async (req, res) => {
  const getItemId = req.body.updatedItemId
  const getNewTitle = req.body.updatedItemTitle
  try {
    await pgdb.query(
      "update items set title = $1 where id = $2",
      [getNewTitle,getItemId]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
    const items = await selectedItems();
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
      error: "มึงมันมาแล้ววววว",
    });
  }
});

app.post("/delete", async (req, res) => {
  const WantIdDelete = req.body.deleteItemId

  try {
    await pgdb.query(
      "delete from items where id = $1",
      [WantIdDelete]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
    const items = await selectedItems();
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
      error: "ลบไม่ออกว่ะเพื่อน",
    });
  }
  
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
