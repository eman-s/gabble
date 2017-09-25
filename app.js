
const express = require('express');
const expressValidator = require('express-validator');
const bodyParser= require('body-parser');
const session = require('express-session');
const mustacheExpress = require('mustache-express');
const client = require('./models/client');
const passport = require('./models/authentication')

const app = express();

app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(session({
  secret:'shhh',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize())
app.use(passport.session())



app.get('/', (req,res) =>{
  req.session.last_visit = new Date();
  console.log(req.session.last_visit);
  console.log('logged in user is:', req.session.user_id);
  res.render('index');
})

app.get('/signup', (req,res) => {
  res.render('signup')
})

app.post('/signup', (req,res,next)=>{
  const {username,password} = req.body;
  const insert = 'INSERT INTO users(username, password) VALUES($1, $2)';
  client.query(insert, [username, password], (err,dbResponse)=>{
    passport.authenticate('local', function (error, user) {
      if (error) {
        next(error);
      } else if (!user) {
        res.redirect('/login');
      } else {
        req.login(user, function(err) {
          if (err) {
            next(err);
          } else {
            req.session.user_id = user.id
            res.redirect('/feed');
          }
        })
      }
    })(req, res, next);
  });
});
//     client.query('SELECT id FROM users WHERE username=$1', [username], (err, dbResponse)=>{
//       const user_id = dbResponse.rows[0].id;
//       req.session.user_id = user_id;
//       res.redirect('/');
//     })
//   })
// })


app.get('/login', (req,res)=>{
  res.render('login');
})

app.post('/login', passport.authenticate('local', {
  successRedirect: '/feed',
  failureRedirect: '/login'
}))

app.get('/feed',(req,res)=>{
  client.query('SELECT COUNT(likes.id) like_count, questions.id, username, questions.user_id, title, body FROM questions LEFT JOIN users ON questions.user_id = users.id LEFT JOIN likes ON questions.id = likes.question_id GROUP BY questions.id, username' , (err, dbResults) => {
    if (err){
      console.log('error is!!!',err);
    }else{
      console.log(dbResults.rows);
      res.render('feed', {
        postInfo: dbResults.rows,
        currentUser: req.user
      });
    }
    // res.json(results.rows)
    // res.send(results.rows)
  });
  console.log('user id is:',req.session.id );
})

app.get('/feed/message/:id/about', (req,res) => {
  let postId = req.params.id
  client.query('SELECT DISTINCT username FROM likes LEFT JOIN users ON users.id = likes.user_id LEFT JOIN questions ON questions.id = question_id WHERE question_id=$1', [postId], (err, dbResults)=>{
    res.render('wholiked', {
      users: dbResults.rows
    })
  })
})

app.post('/feed', (req,res)=>{
  const {title,question} = req.body;
  client.query('INSERT INTO questions(title,body, user_id) VALUES($1, $2, $3)', [title,question,req.user.id], (err, dbResponse)=>{
    console.log(dbResponse.rows);
    res.redirect('/feed');

  })
})

app.post('/feed/message/:id/delete', (req, res)=>{
  let postId = req.params.id
  console.log(postId);
  let currentUserId = req.user.id
  console.log(currentUserId);
    client.query('DELETE FROM questions WHERE id =$1', [postId], (err, dbResponse)=>{
    })
    res.redirect('/feed')
})

app.post('/feed/message/:id/like', (req, res)=>{
  let postId = req.params.id
  console.log(postId);
  let currentUserId = req.user.id
  console.log(currentUserId);
    client.query('INSERT INTO likes(user_id, question_id) VALUES($1, $2)', [currentUserId, postId], (err, dbResponse)=>{
    })
    res.redirect('/feed')
})

app.post('/logout',  (req, res) => {
  req.session.destroy()
  res.redirect('/')
});

app.get('/logout', (req,res)=>{
  res.redirect('/')
})

app.listen(3000, ()=>{
  console.log("listening");
})
