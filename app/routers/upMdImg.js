const formidable = require('formidable');
const path = require("path");
const fs = require("fs");

module.exports = function(req,res){
  let obj = {};
  let descImg = '';
  let form = new formidable.IncomingForm();
  form.encoding = 'utf-8';
  // 上传到vue项目下的static里方便前端访问
  form.uploadDir = path.join(__dirname,"../../static/tmp");
  form.keepExtensions = true;// 保留文件后缀名
  // 限制所有存储表单字段域的大小(除去file字段),如果超出,则会触发error事件,默认为2M(这里不是表单提交没用)
  form.maxFieldsSize = 10 * 1024 * 1024;
  // 处理图片
  form.parse(req, function(err, fields, files){

    if (req.admin === 3) {return res.send({error:3, msg:'无权操作'});}
    let docTitle = decodeURIComponent(fields.docTitle);
    let docDir = path.join(__dirname,"../../static/upload/"+docTitle);
    // let date = new Date();
    // let t = date.getFullYear() + "_" + (date.getMonth()+1) + "_" + date.getDate() + "_" + date.getHours() + "_" + date.getMinutes() + "_" + date.getSeconds();
    // let docDir1 = path.join(docDir + '/' + t);
    try {
      fs.accessSync(docDir);
      // console.log('文件/目录存在');
    } catch (error) {
      // console.log('文件/目录不存在');
      // 创建目录
      try {
        fs.mkdirSync(docDir);
      } catch (error) {
        if (error) {res.send({error:1,msg:'图片上传错误，请稍后重试'});}
      }
    }

    // console.log(fields);
    // console.log(files);
    // if (err) {res.send({error:1,msg:'服务器异常，请稍后重试'});throw new Error('图片上传出错，请稍后重试');}
    for (let imgNum in files) {
      let nameArr = files[imgNum].name.split('.');
      let type = nameArr[nameArr.length - 1];
      let name = '';
      for (let i = 0; i < nameArr.length - 1; i++) {
        name = name + nameArr[i];
      }
      let date1 = new Date();
      let time = '_' + date1.getFullYear() + "_" + (date1.getMonth()+1) + "_" + date1.getDate() + "_" + date1.getHours() + "_" + date1.getMinutes() + "_" + date1.getSeconds();
      if (imgNum !== 'descImg') {
        let avatarName = name + time + '.' + type;
        let newPath = docDir + "/" + avatarName;
        fs.renameSync(files[imgNum].path, newPath);  // 重命名
        obj[imgNum] = `/static/upload/${encodeURIComponent(docTitle)}/${avatarName}`;
      }else{
        let avatarName = 'descImg' + time + '.' + type;
        let newPath = docDir + "/" + avatarName;
        fs.renameSync(files[imgNum].path, newPath);
        descImg = `/static/upload/${encodeURIComponent(docTitle)}/${avatarName}`;
      }
    }

  })

  form.on('end', function() {
    res.send({error:0,url:obj,descImg:descImg})
  })

}
