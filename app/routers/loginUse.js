const
  userOn = require('../model/useron')
  ,jwtUtil = require('./jwt')
;

// error:1是各种错误,2是账号在别处登录,3是非管理员登录,4是登录过期
module.exports = function(app){

  // 拦截并校验token合法性的中间件
  app.use(function(req, res, next){
    // if (req.method !== 'POST') {next();}
    let arr = ['/login','/reset','/upMdImg','/upDoc','/docList','/docLoad','/docCmt'];
    // if (req.url.indexOf('/upMdImg') !== -1) {next();return;}
    if (arr.indexOf(req.url) === -1 && req.headers.authorization !== undefined && req.headers.uid !== undefined) {
      let {authorization,uid} = req.headers;
      if (uid !== '5d6e26993dbb222cf888fc27') {req.admin = 3;}
      let jwt = new jwtUtil(authorization);
      let result = jwt.verifyToken();
      // 如果考验通过就next，否则就返回登陆信息不正确
      if (result == 'err') {
        req.login = 4;next();
      } else {
        userOn.findOne({uid},(err,user) => {
          if (err) {return res.send({error:1,msg:'服务器异常，请稍后重试'});}
          if (!user) {req.login = 4;next();}
          if (user.uToken === authorization) {next();}
          else{req.login = 2;next();}
        });
      }
    } else {
      if (req.headers.authorization === undefined && req.headers.uid === undefined) {req.login = 4;}
      next();
    }
  });

  // 打开页面时校验token的
  app.use('/loginOn',(req,res) => {
    if (req.login === 4) {return res.send({error:4, msg:'登录已过期,请重新登录'});}
    if (req.login === 2) {return res.send({error:2, msg:'您的账号在别处登录,请重新登录'});}
    res.send({error:0});
  });

  // 退出登录的
  app.use('/logout',(req,res) => {
    let {uid} = req.body;
    userOn.deleteOne({uid},(err,info) => {
      if (err) {res.send({error:1,msg:'服务器异常，请稍后重试'});}
      res.send({error:0,msg:'注销成功'});
    })
  });

}
