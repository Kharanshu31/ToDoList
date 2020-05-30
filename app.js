//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

const itemSchema= {
  name :String
};

const Item=mongoose.model("Item",itemSchema);

const  item1=new Item ({
  name:"a"
});

const  item2=new Item ({
  name:"b"
});

const  item3=new Item ({
  name:"c"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

const day = date.getDate();

Item.find({},function(err,foundItems){
  if(foundItems.length==0){
    Item.insertMany(defaultItems,function(err){
      if(err)
      console.log(err);
      else
      console.log("successfully added items");
    });
    res.redirect("/");
    // res.render("list", {listTitle: day, newListItems: foundItems});
  }
  else{
    res.render("list", {listTitle: day, newListItems: foundItems});
  }
});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const itemText=new Item({
    name:itemName
  });

  itemText.save();

  res.redirect("/");

});

app.post("/delete",function(req,res){
  const checkeditem=req.body.check;
  const listname=req.body.listName;

  if(listname===date.getDate())
  {
    Item.findByIdAndRemmove(checkeditem,function(err){
      if(err)
      console.log(err);
      else
      console.log("successfully deleted");
      res.render("/");
    });
  }

  else
  {
    List.findOneAndUpdate({name:listname},{$pull: {items: {_id:checkeditem}}},function(err,foundList){
        if(!err)
        {
          res.redirect("/"+listname);
        }
    });

  }


});

app.get("/:paramName",function(req,res){
  const paramname=req.param.paramName;

  List.findOne({name:paramname},function(err,foundList){
    if(err)
    console.log(err);
    else{
      if(!foundList){
        const list=new List({
          name:paramname,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+paramname)
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }

    }

  })

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
