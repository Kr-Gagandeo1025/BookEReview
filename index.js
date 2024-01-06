import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

const app = express();
const port = 3000;

const db = new pg.Client(
    {
       connectionString: process.env.DB_URL,
       ssl:{
        rejectUnauthorized:false
       }
    }
);
try{
    await db.connect();
    console.log("db connected")
}catch(err){
    console.log(err);
}

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('views', './src/views');
app.set("view engine","ejs");

let items = [];
let authenticated = 0;
let username = "";
let mainCommand = "SELECT * FROM bookreviews";
app.get("/", async (req,res)=>{
    // console.log(items);
        try{
            const Result = await db.query(mainCommand);
            items = Result.rows;
            // console.log(items);
        }catch(err){
            items = [{ id: 1,
                title: 'ERROR 404 books not found',
                review: 'Sorry our database is down! Something went wrong',
                author: 'db admin',
                rating: 404,
                published_on:'never'}]
        }
    res.render("index.ejs",{
        listItems:items,
    });
})

let newPostErr = "";
app.get("/new-post",async(req,res)=>{
    if(authenticated === 0){
        res.redirect("/login");
    }else{
        authenticated = 0;
        res.render("new.ejs",{
            userid : username,
            errs : newPostErr,
        });
    }
})

app.post("/post-review", async(req, res)=>{
    newPostErr = "";
    const title = req.body.title;
    const review = req.body.review;
    const author = req.body.author;
    const rating = req.body.ratings;
    const isbn = req.body.isbn;
    console.log(title,review,author,rating,isbn);
    if(title && review && author && isbn){
        console.log("ok this can be submitted");
        try{
            await db.query("INSERT INTO bookreviews (title, review, author, rating,published_on,isbn) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5);",[
                title,
                review,
                author,
                rating,
                isbn
            ]);
            console.log("successful");
            res.redirect("/");
        }catch(err){
            console.log(err);
            res.redirect("/");
        }
    }else{
        newPostErr = "Please fill all fields correctly..";
        authenticated = 1;
        res.redirect("/new-post");
    }
})

app.post("/arrange",async(req, res)=>{
    console.log(req.body["arrange_btn"]);
    if(req.body["arrange_btn"] == "latest"){
        mainCommand = "SELECT * FROM bookreviews ORDER BY timestamp DESC;";
    }
    else if(req.body["arrange_btn"] == "most-rated"){
        mainCommand = "SELECT * FROM bookreviews ORDER BY rating DESC;";
    }
    else if(req.body["arrange_btn"] == "least-rated"){
        mainCommand = "SELECT * FROM bookreviews ORDER BY rating;";
    }
    res.redirect("/");
})

let logErrs = [];
app.get("/login",async (req, res)=>{
    res.render("login.ejs",{
        errors:logErrs,
    });
})

app.post("/login/authenticate",async(req,res)=>{
    logErrs = [];
    const userid = req.body.userid;
    const password = req.body.password;
    const currentUsers =  await db.query("SELECT * FROM users;");
    let chk = 0;
    let userpassword = "";
    currentUsers.rows.forEach((user)=>{
        if(user.user_id === userid){
            userpassword = user.password;
            chk = 1;
        }
    })
    if(chk===0){
        logErrs.push({message:"User not found"});
        res.redirect("/login");
    }else{
        if(await bcrypt.compare(password,userpassword)){
            authenticated = 1;
            username = userid;
            res.redirect("/new-post");
        }else{
            logErrs.push({message:"Inavalid Password"});
            res.redirect("/login");
        }
    }

})
let RegErrs = [];
app.get("/register",async (req, res)=>{
    res.render("register.ejs",{
        errors:RegErrs,
    });
})

app.post("/register/newuser",async(req,res)=>{
    RegErrs=[];
    const userid = req.body.userid;
    const password = req.body.password;
    const password2 = req.body.password2;
    if(!userid || !password || !password2){
        RegErrs.push({message:"Please enter all details"});
        res.redirect("/register");
    }else if(password.length < 6 ){
        RegErrs.push({message:"password is less than 6 digits"});
        res.redirect("/register");
    }else if(password != password2){
        RegErrs.push({message:"password does not match"});
        res.redirect("/register");
    }
    else{
        const currentUsers = await db.query("SELECT * FROM users;");
        let chk = 0;
        currentUsers.rows.forEach((user)=>{
            if(user.user_id === userid){
                chk = 1;
            }
        })
        if(chk === 1){
            RegErrs.push({message:"User id taken..."});
            res.redirect("/register");
        }else{
            const hashedPassword = await bcrypt.hash(password,10);
            await db.query("INSERT INTO users (user_id,password) VALUES ($1,$2);",[userid,hashedPassword]);
            username = userid;
            authenticated = 1;
            res.redirect("/new-post");
        }
    }
})

app.listen(process.env.PORT || port, () => console.log(`Listening on port ${port}`));