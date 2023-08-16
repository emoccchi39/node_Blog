const express = require("express")
const app = express()
app.use(express.urlencoded({extended: true}))
const mongoose = require("mongoose")
const session = require("express-session")

app.set("view engine", "ejs")
app.use("/public", express.static("public"))

// Session
app.use(session({
    secret:"secretKey",
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:300000}
}))

// Connecting to MongoDB
mongoose.connect("mongodb+srv://emocchi39:masatakaP39@cluster0.mqn0zmg.mongodb.net/blogUserDatabase?retryWrites=true&w=majority")
.then(() => {
    console.log("Success: Connected to MongoDB")
})
.catch((error) => {
    console.error("Failure: Unconnected to MongoDB")
})

// Defining Schema and Model
const Schema = mongoose.Schema

const BlogSchema = new Schema({
    title: String,
    summary: String,
    image: String,
    textBody: String
})

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password:  {
        type: String,
        required: true
    }
})

const BlogModel = mongoose.model("Blog",BlogSchema)
const UserModel = mongoose.model("User", UserSchema)

// BLOG function

// Create Blog
app.get("/blog/create",(req,res) =>{
    if(req.session.userId){
        res.render("blogCreate")
    }else{
        res.redirect("/user/login")
    }
})

app.post("/blog/create",async(req,res) =>{
    console.log("POST")
    try {
        const savedBlogData = await BlogModel.create(req.body);
        res.redirect("/")
    } catch (error) {
        res.render("error",{messaage: "/blog/createのエラー"});
    }    
})

// Read All Blogs
app.get("/", async(req,res) => {
    const allBlogs = await BlogModel.find()

    res.render("index", {allBlogs: allBlogs, session: req.session.userId})
})

// Read Single Blog
app.get("/blog/:id",async(req,res) =>{
    const singleBlog = await BlogModel.findById(req.params.id)
    res.render("blogRead",{singleBlog: singleBlog,session: req.session.userId})
})

// Update Blog
app.get("/blog/update/:id",async(req,res) =>{
    const singleBlog = await BlogModel.findById(req.params.id)
    res.render("blogUpdate", {singleBlog})
})

app.post("/blog/update/:id",async(req,res) =>{
    try {
        await BlogModel.updateOne({_id:req.params.id},req.body);
        res.redirect("/")
    } catch (error) {
        res.render("error",{messaage: "/blog/updateのエラー"})
    }    
})

// Delete Blog
app.get("/blog/delete/:id",async(req,res) =>{
    const singleBlog = await BlogModel.findById(req.params.id)
    res.render("blogDelete", {singleBlog})
})

app.post("/blog/delete/:id",async(req,res) =>{
    try {
        await BlogModel.deleteOne({_id:req.params.id});
        res.redirect("/")
    } catch (error) {
        res.render("error",{messaage:"/blog_deleteのエラー"})
    }    
})

// User function
// Create user
app.get("/user/create",(req,res)=>{
    res.render("userCreate")
})

app.post("/user/create",async(req,res) =>{
    try {
        const savedUserData = await UserModel.create(req.body);
        res.redirect("/user/login")
    } catch (error) {
        res.render("/user/create")
    }    
})

// user Login
app.get("/user/login", (req,res) =>{
    res.render("login")
})

app.post("/user/login", async (req, res) => {
    try {
        const savedUserData = await UserModel.findOne({ email: req.body.email });
        if (savedUserData && req.body.password === savedUserData.password) {
            // ログイン成功時の処理
            req.session.userId = savedUserData._id
            res.redirect("/")
        } else {
            res.render("error", {messaage: "/user/loginのエラー：パスワードが間違っています"})
        }
    } catch (error) {
        // エラーハンドリング
        res.render("error", {messaage: "/user/loginのエラー：ユーザーが存在しません"})
    }
});

// Connecting to port
const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Listening on ${port}`)
})