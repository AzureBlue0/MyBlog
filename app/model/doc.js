const mongoose = require('mongoose');

const docSchema = new mongoose.Schema({
  uid:{
    type: mongoose.Schema.Types.ObjectId
    ,ref: 'user'// 指定关联的是user表
    ,trim: true
  }
  ,docTitle:{
    type: String
    ,required: true
    ,trim: true
  }
  ,desc:{
    type: String
    ,required: true
    ,trim: true
  }
  ,descImg:{
    type: String
    ,required: true
    ,trim: true
  }
  ,markdown:{
    type: String
    ,required: true
    ,trim: true
  }
  ,mdHtml:{
    type: String
    ,required: true
    ,trim: true
  }
  ,docLabel: Array
  ,readNum:{
    type: Number
    ,required: true
    ,default: 1
  }
},{timestamps: {createdAt: 'created', updatedAt: 'updated'}});

module.exports = mongoose.model('doc',docSchema);
