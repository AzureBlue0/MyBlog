const Doc = require('../model/doc');

module.exports = function(req,res){

  if (req.admin === 3) {return res.send({error:3, msg:'无权操作'});}
  let {uid} = req.headers;
  let data = req.body;
  let docId = req.body.docId
  if (docId !== undefined) {
    Doc.updateOne({_id:docId},data,{upsert:true})
    .then(info => {
      if (info.ok === 1) {
        res.send({error:0,msg:'文章更新成功'});
      }
    })
    .catch(err => {
      res.send({error:1,msg:'服务器异常，请稍后重试'});
    });
  } else {
    data.uid = uid;
    data.readNum = 1;
    Doc.create(data)
    .then(info => {
      if (info) {res.send({error:0,msg:'文章发表成功'});}
      else {res.send({error:1,msg:'服务器异常，请稍后重试'});}
    })
    .catch(err => {
      res.send({error:1,msg:'服务器异常，请稍后重试'});
    });
  }

}
