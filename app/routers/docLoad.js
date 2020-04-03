const mongoose = require('mongoose');
const Doc = require('../model/doc');
const Comment = require('../model/comment');
const Users = require('../model/user');

module.exports = function(app){
  app.use('/docList',(req,res) => {// 首页读取文章列表
    // estimatedDocumentCount()是计算集合中的总文档数
    // countDocuments()是计算与查询匹配的总文档数,可以接受查询条件作为参数
    let page = req.body.page || 0;
    let loadNum = 3;
    let label = req.body.label;
    let query = label ? {docLabel:label} : {};
    Doc.find(query,{descImg:1,docTitle:1,created:1,docLabel:1,desc:1}).limit(loadNum).skip(page * loadNum)
    .then(async data => {
      let total = await Doc.countDocuments(query);
      let maxPage = Math.ceil(total/loadNum);
      Doc.find({},{descImg:1,docTitle:1,updated:1},(err,info) => {
        if (err) {return res.send({error:1,msg:'服务器异常，请稍后重试'});}
        let userIp = req.ip;
        res.send({error:0,data:data,maxPage:maxPage,info,userIp});
      }).sort({created:1});// sort排序,-1是倒序,1是正序,获取6条修改时间最新的文章
    })
    .catch(err => {
      res.send({error:1,msg:'服务器异常，请稍后重试'});
    })
  });

  app.use('/docLoad',(req,res) => {// 文章页读取文章
    let docId = req.body.docId;
    /*查询上一页*/
    const findPrev = () => new Promise((resolve) => {
      Doc.findOne({_id:{'$lt': docId}},{docTitle:1}).exec((err, result) => {resolve(result)})
    });
    /*查询下一页*/
    const findNext = () => new Promise((resolve) => {
      Doc.findOne({_id:{'$gt': docId}},{docTitle:1}).exec((err, result) => {resolve(result)})
    });
    Doc.findOne({_id:docId},{uid:0,desc:0,markdown:0},(err,data1) => {
    // Doc.findOneAndUpdate({_id:docId},{$inc:{readNum: 1}},{fields:{uid:0,desc:0,markdown:0},new:true},(err,data1) => {
      if (err) {res.send({error:1,msg:'数据为空'});return false}
      Promise.all([findPrev(), findNext()])
      .then(data => {
        if (!data[0]) {data[0] = {docTitle:'没有了'}}
        if (!data[1]) {data[1] = {docTitle:'没有了'}}
        res.send({error:0,data:data1,prev:data[0],next:data[1]});
      })
      .catch(err => {
        res.send({error:1,msg:'服务器异常，请稍后重试'});
      })
    })
  });

  app.use('/upCmt',(req,res) => {// 发表评论
    // 先验证登录
    if (req.login === 4) {return res.send({error:4, msg:'登录已过期,请重新登录'});}
    if (req.login === 2) {return res.send({error:2, msg:'您的账号在别处登录,请重新登录'});}

    let {pcmtid,puid,cmtId,data} = req.body;
    Users.findOne({_id:data.uid},(err,user) => {
      if (err) {return res.send({error:1,msg:'回复失败，请稍后重试'});}
      if (!pcmtid || !puid) {// 普通回复
        Comment.create(data,(err,info) => {
          if (err) {return res.send({error:1,msg:'回复失败，请稍后重试'});}
          // info就是新增的数据
          info.uid = user;
          res.send({error:0,msg:'回复成功',data:info});
        });
      } else {// 楼中楼回复
        let fId = cmtId == null ? pcmtid : cmtId;
        data.puid = puid;data.pcmtid = pcmtid;data.state = false;
        Comment.findOneAndUpdate({_id:fId},{$push:{child:data}},{new:true},(err,info) => {
          if (err) {return res.send({error:1,msg:'回复失败，请稍后重试'});}
          info = info.child[info.child.length-1];
          info.uid = user;
          res.send({error:0,msg:'回复成功',data:info});
        });
      }
    });
  });

  app.use('/docCmt',(req,res) => {// 文章页获取评论
    let {did} = req.body;// 父评论的用户id和子评论的用户id都需要关联查询,并且倒序排序,最新的评论在前面
    Comment.find({did},(err,data) => {
      if (err) {return res.send({error:1,msg:'服务器异常，请稍后重试'});}
      res.send({error:0,data:data});
    }).populate('uid').populate('child.uid').populate('child.puid').sort({created:-1});
  });

  app.use('/userCmt',(req,res) => {// 个人中心获取未读评论和全部评论
    // 先验证登录
    if (req.login === 4) {return res.send({error:4, msg:'登录已过期,请重新登录'});}
    if (req.login === 2) {return res.send({error:2, msg:'您的账号在别处登录,请重新登录'});}
    // 这里是读取未读评论或全部评论
    let puid = req.headers.uid,{state} = req.body,matchObj = {};
    if (state) {
      matchObj = {"child.puid": mongoose.Types.ObjectId(puid)};
    } else {
      matchObj = {"child.puid": mongoose.Types.ObjectId(puid),"child.state": false};
    }
    // 要获取到用户名和文章id(地址),3表联查,所以用聚合查询
    Comment.aggregate([
      {$unwind: "$child"}
      ,{$lookup: {from: "users",localField: "child.puid",foreignField: "_id",as: "child.puid1"}}
      ,{$lookup: {from: "docs",localField: "did",foreignField: "_id",as: "child.did"}}
      ,{$match: matchObj}
      ,{$sort:{"child.created":1}}
      // ,{$project: {"child":1}}
      ,{$group: {"_id": '$child'}}
      ,{$project: {"_id.puid1.password":0,"_id.did.markdown":0,"_id.did.mdHtml":0,"_id.did.desc":0,"_id.did.descImg":0,"_id.did.docLabel":0,"_id.did.docTitle":0,"_id.did._id":0,"_id.did.uid":0,"_id.did.__v":0,"_id.did.created":0,"_id.did.updated":0,"_id.did.readNum":0}}
    ],(err,data) => {
      if (err) {return res.send({error:1,msg:'服务器异常，请稍后重试'});}
      res.send({error:0,data:data});
    });
  });

  app.use('/userCmtUp',(req,res) => {// 个人中心更新评论已读状态
    // 先验证登录
    if (req.login === 4) {return res.send({error:4, msg:'登录已过期,请重新登录'});}
    if (req.login === 2) {return res.send({error:2, msg:'您的账号在别处登录,请重新登录'});}
    // 更新评论已读状态
    let puid = req.headers.uid,{len} = req.body;
    for (let i=0; i < len; i++) {
      // 找到全部对应的子评论的父级评论用户id,并且状态为未读,然后把状态全部改为已读,child.$.state中的$是第n个的意思
      // multi:true是否应该更新多个文档
      // 第一个对象是条件,第二个对象是修改内容,第三个是可选参数
      Comment.updateMany({'child.puid':puid,'child.state':false},{$set:{'child.$.state':true}},{multi:true},(err,info) => {
        if (err) {return res.send({error:1,msg:'服务器异常，请稍后重试'});}
        if (i === len-1) {res.send({error:0});}
      });
    }
  });
}
