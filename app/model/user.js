const mongoose = require('mongoose');
// 引入node自带的加密模块
const crypto = require("crypto");

// 定义Schema
const userSchema = new mongoose.Schema({
    username : {
        type:String,
        unique:true,
        required:true,
        match : /^[\d_a-z\u4e00-\u9fa5]{2,18}$/i,
        trim: true
    },
    password : {
        type: String,
        required: true,
        match: /^[\da-z_,!@#\$%\^&*()+\[\]{}\-=\.<>?]{6,18}$/i,
        trim: true
    },
    userInfo : {
        // sex : {type:String,enum:["男","女"]}
        // ,age : {type:Number,min:0}
        // ,email : {type:String,match : /^[\da-z_]+@[\da-z]+(\.[a-z]+)+$/i}
        // ,tel : {type:String,match : /^1[3456878]\d{9}$/}
        // ,status : {type:String,default:"这人很懒，没有签名……"}
        photo : {type:String,default: "/static/default.jpg"}
    }
});

// 密码加密 中间件
userSchema.pre("save",function(next){
    //使用node自带的加密模块，对传入的原始密码进行加密
    let newPwd = crypto.createHash('sha256').update( this.password ).digest("hex");
    //console.log(newPwd);
    this.password = newPwd;
    next();
});

// 建表,并返回
module.exports = mongoose.model('user',userSchema);
