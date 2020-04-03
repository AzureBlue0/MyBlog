const Doc = require('../model/doc');

module.exports = function(req,res){
  // 先验证登录
  if (req.login === 4) {return res.send({error:4, msg:'登录已过期,请重新登录'});}
  if (req.login === 2) {return res.send({error:2, msg:'您的账号在别处登录,请重新登录'});}
  if (req.admin === 3) {return res.send({error:3, msg:'无权操作'});}
  // 这里是文章管理内读取文章内容和读取文章列表和删除
  if (req.url === '/loadDoc') {
    Doc.findOne({_id: req.body.docId})
    .then(data => {
      res.send({error: 0, data: data});
    })
    .catch(err => {
      res.send({error: 1, msg: '服务器异常，请稍后重试'});
    })
  } else if (req.url === '/delDoc') {
    let {docId} = req.body;
    Doc.deleteOne({_id: docId},(err,info) => {
      if (err) {res.send({error:1,msg:'服务器异常，请稍后重试'});}
      res.send({error:0,msg:'删除成功'});
    })
  } else {
    // 限制只返回文章的标题docTitle,数字1是返回0是不返回,不设置的字段不返回,_id默认是1
    Doc.find({},{docTitle:1})
    .then(data => {
      res.send({error:0,data:data});
    })
    .catch(err => {
      res.send({error:1,msg:'服务器异常，请稍后重试'});
    })
  }
}
