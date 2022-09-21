const express=require("express"); 
const bodyParser=require("body-parser"); 
const mongoose=require('mongoose');
const app=express();    
var _=require("lodash");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine','ejs') ; 
// var items=["First Item","sec item"];
// let workitem=[];
mongoose.connect("mongodb://localhost:27017/deepDB");
const itemschema={
    name:String
};
const Item=mongoose.model("Item",itemschema);



const item1=new Item({
    name:"maggi"
})
const item2=new Item({
    name:"icecream"
})
const item3=new Item({
    name:"noodles"
})   
// item1.save();
// item2.save();
// item3.save();     
 const defaultitems=[item1,item2,item3];

 //rendering data
app.get("/",function(req,res){
    Item.find({},function(error,result){  
        //find or findall gives us array as result 
        if(result.length==0){
            Item.insertMany(defaultitems,function(err){
    if(err){
        console.log(err)
    }else{
        console.log("succesfully inserted in the database")
    }
    })   
    res.redirect("/")
   } else{
   res.render("list",{listtittle:"Today",newlistitemarray:result}); 
   }
   }) ;
   }) ;  
   //ading new items
app.post("/",function(req,res){    
    const itemname=req.body.nitem;  
    const listname=req.body.list; 
    const newitem=new Item({
        name:itemname
    })  
    if(listname=="Today"){
        newitem.save(); 
        res.redirect("/");
    }  else{
        List.findOne({name:listname},function(err,foundlist){
            foundlist.items.push(newitem);
            foundlist.save();
            res.redirect("/"+ listname)
        })
    }
})
 

//Now lets create a dynamic route so that we can directly access all the routes we wnat without need to make them again using get method     
const listSchema={
    name:String,
    items:[itemschema]
}   
const List=mongoose.model("List",listSchema);

app.get("/:customlistname",function(req,res){
    const customlistname=_.capitalize(req.params.customlistname); 
    List.findOne({name:customlistname},function(err,foundlist){
        if(!err){
            if(!foundlist){
                // console.log("does  not exist")
                //create a new list 
                const list=new List({
                    name:customlistname,
                    items:defaultitems
                   })  
                   list.save();
                res.redirect("/" + customlistname)
            }else{
            // console.log(" exist") 
            //show an existing list
               res.render("list",{listtittle:foundlist.name,newlistitemarray:foundlist.items})
            }
        }  
    })
  
})   
//deletion of an element
app.post("/delete",function(req,res){
    const checkitemid=req.body.checkbox; 
    const listname=req.body.listname; 
    if(listname=="Today"){
   Item.findByIdAndRemove(checkitemid,function(err){
    if(!err){
        console.log("succesfullt deleted item.");
        res.redirect("/") 
    }
}) 
} else{
      List.findOneAndUpdate({name:listname},{$pull:{items:{_id:mongoose.Types.ObjectId(checkitemid)}}},function(err,foundlist){
        if(!err){  
            console.log(listname + checkitemid+ foundlist);
            res.redirect("/"+listname);
        }
      })
}
}) 
app.listen(7000,function(){
    console.log("server is listening at port 7000");
}); 