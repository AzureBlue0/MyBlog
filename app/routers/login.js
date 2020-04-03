const Users = require('../model/user');
const userOn = require('../model/useron');
const crypto = require("crypto");
const jwtUtil = require('./jwt');

module.exports = function(req,res){
    //console.log(req.body);
    // res.send({ok:1});
    //res.send(req.body);
    let {username,password} = req.body;
    Users.findOne({username})
    .then(user=>{
      if(user){
        let pwd = crypto.createHash('sha256').update(password).digest("hex");
        if(pwd === user.password){
          let uid = user._id;
          let jwt = new jwtUtil(uid);
          let uToken = jwt.generateToken();
          userOn.updateOne({uid},{uid,uToken},{upsert:true})
          .then(()=>{
            res.send({error:0,msg:'登录成功',uid:uid,token:uToken,photo:user.userInfo.photo});
          })
          .catch(err=>{
            res.send({error:1,msg:'服务器异常，请稍后重试'});
          });
        }else{
          res.send({error:1,msg:'密码错误'});
        }
      }else{
        res.send({error:1,msg:'用户不存在，请先注册'});
      }
    })
    .catch(err=>{
      res.send({error:1,msg:'服务器异常，请稍后重试'});
    });
}
