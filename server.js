var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var exphbs = require('express-handlebars');
var dataService = require('./data-service.js');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('.hbs',exphbs({
    extname:'.hbs', 
    defaultLayout:'main',
    helpers:{
        navLink:function(url, options){
            return '<li' + ((url==app.locals.activeRoute)? ' class="active"':'')
                +'><a href="'+url+'">'+options.fn(this)+'</a></li>'
        },
        equal:function(lvalue, rvalue, options){
            if(arguments.length<3)
                throw new Error("Handlerbars Helper equal needs 2 parameters");
            if(lvalue != rvalue){
                return options.inverse(this);
            }else{
                return options.fn(this);
            }
        }
    }
}));
app.set('view engine','.hbs');
app.use(function(req,res,next){
    let route=req.baseUrl + req.path;
    app.locals.activeRoute = (route=="/")? "/":route.replace(/\/$/,"");
    next();
});

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    //res.sendFile(path.join(__dirname+"/views/home.html"));
    res.render("addEmployee");
});

app.get('/employees', (req, res) => {
    dataService.getAllEmployees()
        .then((data) => res.render("employees",{employees:data}))
        .catch(() => res.render("employees",{message: "no results"}))
});

app.get('/login', (req, res) => { 
    res.render("employees",{});
})

app.get('/curloc', (req, res) => { 
    dataService.getAllLocation()
        .then((data) => res.render("curlocation",{curLocation:data}))
        .catch(() => res.render("curlocation",{message: "no results"}))
})

app.get("/employees/add", (req, res) => {
    //res.sendFile(path.join(__dirname+"/views/addEmployee.html"));
    res.render("addEmployee");
});

app.get('/departments', (req, res) => {
    dataService.getDepartments()
        .then((data) => res.render("departments",{departments:data}))
        .catch(() => res.render("departments",{"message": "no results"}))
})
//POST

//add validation for username and password
app.post("/login", function (req, res) {
    dataService.checkUser(req.body).then(() => {
        res.redirect('/employees');
        })
    .catch((err) => res.render("addEmployee",{errorMessage: err,userName:req.body.userName}))
});


app.get('*', (req, res) => {
    //res.send("Page Not Found");
    res.status(404);
    res.redirect("https://cdn-images-1.medium.com/max/1600/1*2AwCgo19S83FGE9An68w9A.gif");
})

// setup http server to listen on HTTP_PORT
dataService.initialize()
.then((data) => {
    app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
})
.catch(() => {
    console.log("There was an error initializing");
})

setInterval(function(){
    dataService.initialize()
}, 1000)