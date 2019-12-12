var express = require("express")
var app = express()
var bodyparser = require("body-parser")
var methodoverride = require("method-override")
var sanitizer = require("express-sanitizer")
var mongoose = require("mongoose")
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://127.0.0.1:27017/blog", { useFindAndModify: false });
mongoose.connect("mongodb://127.0.0.1:27017/blog",{ useNewUrlParser: true })

app.use(express.static("public"))
app.use(bodyparser.urlencoded({extended:true}))
app.use(sanitizer())
app.use(methodoverride("_method"))
app.set("view engine","ejs")

var blogSchema = new mongoose.Schema({
	title : String,
	image : String,
	body : String,
	created : {type : Date,default: Date.now}
})

var Blog = mongoose.model("Blog",blogSchema)

app.get("/", function(req,res){
	res.redirect("/blogs")
})

app.get("/blogs", function(req,res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err)
		}
		else{
			res.render("index",{blogs:blogs})		
		}
	})
	
})

app.post("/blogs", function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body)
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("index")
		}
		else{
			res.redirect("/blogs")
		}
	})
})

app.get("/new", function(req, res){
	res.render("new")
})

app.get("/blogs/:id", function(req,res){
	Blog.findById(req.params.id, function(err, showblog){
		if(err){
			console.log(err)
		}
		else{
			res.render("show", {blog : showblog})
		}
	})
})

app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs")
		}
		else{
		res.render("edit" , {blog : foundBlog})		
		}
	})
	
})

app.put("/blogs/:id", function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body)
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updated){
		if(err){
			res.redirect("/blogs")
		}
		else{
			res.redirect("/blogs/"+req.params.id)
		}
	})
})

app.delete("/blogs/:id", function(req,res){
	Blog.findByIdAndDelete(req.params.id, function(err){
		if(err){
			res.redirect("/blogs")
		}
		else{
			res.redirect("/blogs")
		}
	})
})

app.listen(8090,()=>{
	console.log("Blogapp Begins")
})