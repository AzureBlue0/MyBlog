const formidable = require('formidable');
const path = require("path");
const fs = require("fs");
const Users = require('../model/user');
const crypto = require("crypto");

module.exports = function(req,res){
  let form = new formidable.IncomingForm();
  form.encoding = 'utf-8';
  // 上传到vue项目下的static里方便前端访问
  form.uploadDir = path.join(__dirname + "../../../static/tmp");
  form.keepExtensions = true;// 保留文件后缀名
  // 限制所有存储表单字段域的大小(除去file字段),如果超出,则会触发error事件,默认为2M(这里不是表单提交没用)
  form.maxFieldsSize = 10 * 1024 * 1024;
  // 处理图片
  form.parse(req, function(err, fields, files){
    // 先验证登录
    if (req.login === 4) {return res.send({error:4, msg:'登录已过期,请重新登录'});}
    if (req.login === 2) {return res.send({error:2, msg:'您的账号在别处登录,请重新登录'});}

    let {uid} = req.headers;
    let data = {};
    // 头像图片
    if (files.touxiang) {
      let upName = files.touxiang.path.match(/(?<=tmp\\).+/g)[0];
      let newPath = path.join(__dirname + "../../../static/touxiang/") + upName;
      fs.renameSync(files.touxiang.path, newPath);
      data.userInfo = {};
      data.userInfo.photo = `/static/touxiang/${upName}`;
    }
    // 昵称密码
    let arr = Object.getOwnPropertyNames(fields);// 返回指定对象所有属性的属性名的数组
    if (arr.length !== 0) {
      // console.log(fields,arr,fields[arr[0]]);
      for (let i=0; i < arr.length; i++) {
        if (arr[i] === 'password') {fields.password = crypto.createHash('sha256').update(fields.password).digest("hex");}
        // let pwd = crypto.createHash('sha256').update(password).digest("hex");
        data[arr[i]] = fields[arr[i]];
      }
    }
    // console.log(data);
    // 旧昵称123,头像/static/default.jpg,密码:
    // 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
    Users.updateOne({_id:uid},data,(err,info) => {
      if (err && err.code === 11000) {return res.send({error:1,msg:'昵称已存在'});}
      if (err) {return res.send({error:1,msg:'服务器异常，请稍后重试'});}
      if (info.ok === 1) {
        if (files.touxiang) {return res.send({error:0,msg:'修改完成',photoSrc:data.userInfo.photo});}
        return res.send({error:0,msg:'修改完成'});
      }
    });
  })

  // form.on('end', function() {})
}
