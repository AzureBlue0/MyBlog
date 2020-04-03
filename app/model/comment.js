const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  uid:{
    type:mongoose.Schema.Types.ObjectId
    ,ref:'user'// 指定关联的是user表
    ,required: true
  }
  ,did:{
    type:mongoose.Schema.Types.ObjectId
    ,ref:'doc'// 指定关联的是doc表
    ,required: true
  }
  ,content:{
    type: String
    ,required: true
    ,trim: true
  }
  ,created:{type: Date, default: Date.now}
  ,child:[{
    cid:{type:mongoose.Types.ObjectId}
    ,uid:{
      type:mongoose.Schema.Types.ObjectId
      ,ref:'user'// 指定关联的是user表
      ,required: true
    }
    ,puid:{type:mongoose.Schema.Types.ObjectId,ref:'user'}
    ,pcmtid:mongoose.Schema.Types.ObjectId
    ,content:{
      type: String
      ,required: true
      ,trim: true
    }
    ,state:{
      type: Boolean
      ,default: false
    }
    ,created:{type: Date, default: Date.now}
  }]
},{timestamps: {createdAt: 'created'}});

module.exports = mongoose.model('comment',commentSchema);
