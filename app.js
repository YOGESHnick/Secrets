require('dotenv').config();  //.env file package
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

// const bcrypt=require("bcrypt");
// const saltRounds=10;
// const md5=require("md5");
// console.log(process.env.API_KEY);


const app=express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}))

app.use(session({
  secret:"Our little secret.",
  resave:false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});
// mongoose.set("CreateIndex",true);

const userSchema=new mongoose.Schema({
    email:String,
    password:String
});

userSchema.plugin(passportLocalMongoose);

// user data-> encryption---->
//encrypts data when we use User.save() and decrypts when we use User.find()



//userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"] }); --needed only in lvl 2 security

const User = new mongoose.model("User",userSchema)

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get(s)
app.get("/",function(req,res){
    res.render("home");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});

app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
})

app.post("/register",function(req,res){

  // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  //   const newUser= new User({
  //     email:req.body.username,
  //     password:hash
  //     //password:md5(req.body.password)   //md5 password hashing
  // });
  
  // newUser.save();
  // res.render("secrets");

  User.register({username:req.body.username} , req.body.password ,function(err,user){
    if(err){
        console.log(err);
        res.redirect("/register");
    }
    else{
        passport.authenticate("local")(req,res,function(){
            res.redirect("/secrets");
        })
    }
  });

});

    
app.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        // Handle any potential errors during the logout process
        console.error('Error during logout:', err);
        // Optionally, you may redirect to an error page or display a message to the user.
      }
      // The user has been successfully logged out, proceed with further actions.
      res.redirect('/');
    });
  });

app.post("/login",function(req,res){
    // const username=req.body.username;
    // const password=req.body.password;

    // async function findUser() {
    //     try {
    //       const foundUser = await User.findOne({ email: username });
      
    //       if (foundUser) {
    //         bcrypt.compare(password, foundUser.password, function(err, result) {
    //           if(result === true){
    //             res.render("secrets");
    //           }
    //       });
              
            
    //       }
    //     } catch (err) {
    //       console.log(err);
    //     }
    //   }
      
    //   findUser();

    const user=new User({
        username:req.body.username,
        password:req.body.password
    });

    req.login(user,function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            })

        }
    })
})


app.listen(3000,function(){
    console.log("Server statred at port 3000");
});