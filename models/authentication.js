const {Strategy} = require('passport-local');
const passport = require('passport');
const client = require('./client')

passport.use(new Strategy(
    function(username, password, done) {
      client.query('SELECT * FROM users WHERE username=$1',[username], (err, dbResponse)=>{
        if (err){
          done(err)
        }else{
          console.log("!!!!!", dbResponse.rows[0]);
          console.log(dbResponse.rows[0].id);
          let currentUserId = dbResponse.rows[0].id
          const user = dbResponse.rows[0];
          if(user.password === password){
            return done(null, user)
          }else{
            return done(null, false, {
                      message: "There is no user with that username and password."
            });
          }
        }
      })
    }
  ));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  client.query('SELECT * FROM users WHERE id =$1', [id], (err, dbResponse)=>{
    const user = dbResponse.rows[0];
    done(err, user)
  })
});

module.exports = passport;
