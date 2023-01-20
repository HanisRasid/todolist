const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended:true}));

//sets up express to use static files in the 'public' directory
app.use(express.static("public"));

mongoose.set('strictQuery',false);

//connect to database server
mongoose.connect("mongodb+srv://admin:admin@cluster0.zat67iy.mongodb.net/todolistDB");

//items schema
const itemsSchema ={
    name: String
};

//creates item collection
const Item = mongoose.model("Item",itemsSchema);

//create default items
const item1 = new Item({
    name:"Welcome to your todo-list!"
});
const item2 = new Item({
    name:"Hit the '+' button to add a new item"
});
const item3 = new Item({
    name:"<-- Click on this to check off an item"
});
const defaultItems = [item1,item2,item3];

const ListSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", ListSchema);

//set up ejs for templating
app.set('view engine', 'ejs');

app.get("/", function (req, res) {
    
    Item.find((err,result) =>{
        var items = result;
        if(err){
            console.log(err);
        }
        else if(items.length===0){
            //insert default items into db
            Item.insertMany(defaultItems,(err)=>{
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Default items were successfully added to the database.");
                }
            });
            res.redirect("/");
        }
        else{
            //sends variables to list.ejs
            res.render("list", { listTitle: date(), items:items});
        }
    });

});

//adds user input to array and redirects back to the homepage (get request)
app.post("/",function(req,res){

    var newTask = new Item({
        name: req.body.newTask 
    });

    const listName = _.trim(req.body.list);

    if(listName === date()){
        //saves new item to db
        newTask.save();
        //redirects to the home route
        res.redirect("/");
    }
    else{
        List.findOne({name: listName}, (err,foundList)=>{
            foundList.items.push(newTask);
            foundList.save();
            res.redirect("/" + _.trim(listName));
        });
    }

});

app.post("/delete",(req,res)=>{
    const listName = _.trim(req.body.listName);

    if(listName === date()){
        Item.findByIdAndDelete(req.body.checkbox, (err)=>{
            if(err){
                console.log(err);
            }
            else{
                console.log("Item successfully deleted from DB");
                res.redirect("/");
            }
        });
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull: {items: {_id: req.body.checkbox}}},(err,result)=>{
            if(!err){
                res.redirect("/" +listName);
            }
        });

    }
});

app.get("/:paramName",(req,res)=>{
    const listName = _.capitalize(req.params.paramName);
    List.findOne({name: listName},(err,results)=>{
        //if list doesn't exist
        if(!results){
            const list = new List({
                name : listName,
                items: defaultItems
            });
            list.save();
            res.redirect("/" + _.trim(listName));
        }
        else{
            res.render("list",{ listTitle: results.name, items: results.items});
        }
    });
});

// app.post("/work", (req,res) =>{
//     var workItem = req.body.newTask;
//     workItems.push(workItem);
//     res.redirect("/work");
// });

// app.get("/about", (req,res) =>{
//     res.render("about");
// });

app.listen(3000, function () {
    console.log("Server is listening on port 3000");
});