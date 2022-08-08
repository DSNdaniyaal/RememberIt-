//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const day = date.getDate();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://daniyaal:durdsn%404486@cluster0.s2stylp.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true,"Enter the work you want to add"]
  }
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todolist!"
});

const item2 = new Item ({
  name: "Hit the + button to add a new item."
});

const item3 = new Item ({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema =  mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

Item.find(function(err,items){
if(items.length === 0){
  Item.insertMany(defaultItems,function(err){
    if(err){
      console.log(err);
    }else{
      console.log("successfully inserted to todolistDB.");
    }
  });
  res.redirect("/");
} else {
res.render("list", {listTitle: day, newListItems: items});
}

});
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        // create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/"+customListName);
      } else {
        res.render("list",{listTitle: foundList.name,newListItems: foundList.items});
      }
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name : itemName
  });

  if(listName === day)
  {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete",function(req,res){
  const checkeditemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day){
    Item.findByIdAndRemove(checkeditemId,function(err){
      if(!err){
        console.log("deleted successfully.");
        res.redirect("/");
      }
  });
} else {
  List.findOneAndUpdate({name : listName},{$pull : {items: {_id: checkeditemId}}},function(err,foundList){
    if(!err){
      console.log("deleted successfully.");
      res.redirect("/"+listName) ;
    }
  });
}
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
