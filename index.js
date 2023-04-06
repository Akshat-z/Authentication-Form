import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";

mongoose.connect("mongodb://127.0.0.1:27017",{
   dbName:"backend",
}).then(()=>console.log("Database connected successfully")).catch((e)=>console.log(e));

//* creating Scheme
const userScheme = new mongoose.Schema({
   name:{
      type:String,
      require:[true,"Please fill the name"],
   },
   email:{
      type:String,
      require:[true,"Please fill the email"],
   },
   password:{
      type:String,
      require:[true,"Please fill the password"],
   }
})

//* model
const user=mongoose.model("user",userScheme);

const app=express();

app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(path.resolve(),"public")));
app.use(cookieParser());


app.get("/",async(req,res)=>{
//  console.log(req.cookies); // by npm package cookie-parser
 const {token}=req.cookies; 
 if(token) {
 const decode=jwt.verify(token,"aundsund");  
//  console.log(decode);
 const tt= await user.findById(decode._id);
//  console.log(tt);
   res.render("logout.ejs",{nam:tt.name});
 }
  else res.render("login.ejs");
})

app.post("/register",async (req,res)=>{
   const {name,email,password} =req.body;
   // console.log(req.body);
   const hashpassword= await bcrypt.hash(password,10);

   await user.create({name,email,password:hashpassword});
   res.render("login.ejs");
})

app.post("/login",async (req,res)=>{
    const {email,password} =req.body;
    const isuser= await user.findOne({email});
   //  console.log(isuser.password);
    if(isuser){
    const isMatch = await bcrypt.compare(password,isuser.password);
      if(isMatch==true){
         const token =jwt.sign({_id:isuser._id},"aundsund");
         await res.cookie("token",token,{
          httpOnly:true,
          expires:new Date(Date.now()+60*1000) // in millisecond
         });
      res.redirect("/");
      }
      else res.render("login.ejs",{message:"Passward is not correct"})
    }
    else{
      console.log("User is not present first sign in");
      res.render("register.ejs")
    }
})

app.get("/logout",(req,res)=>{
   res.cookie("token",null,{
      expires:new Date(Date.now()) // in millisecond
     });
     res.redirect("/");
})

app.listen(3000,()=>{
 console.log("Server connected successfully");
})