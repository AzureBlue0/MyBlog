const Users = require('../model/user');

module.exports = function(req,res){
    let {username,password} = req.body;
    if(!/^[\d_a-z\u4e00-\u9fa5]{2,8}$/i.test(username)){res.send({error:1,msg:'用户名格式错误'});}
    if(!/^[\da-z_,/!@#\$%\^&*()+\-=\[\]{}\.<>?]{6,18}$/i.test(password)){res.send({error:1,msg:'密码格式错误'});}
    Users.findOne({username})
    .then(user=>{
        if (user) {
            res.send({error:1,msg:'昵称已存在'});
        }else{
            Users.create({username,password})
            .then(()=>{
                res.send({error:0,msg:'注册成功，请登录'})
            })
            .catch(err=>{
                res.send({error:1,msg:'服务器异常，请稍后重试'});
            });
        }
    })
    .catch(err=>{
        res.send({error:1,msg:'服务器异常，请稍后重试'});
    });
}
