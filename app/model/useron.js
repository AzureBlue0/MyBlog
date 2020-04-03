const mongoose = require('mongoose');

const userOnSchema = new mongoose.Schema({
  uid : {
    type:mongoose.Schema.Types.ObjectId,
    ref:'user',// 指定关联的是user表
    required: true,
    trim: true
  },
  uToken : {
    type:String,
    required: true,
    trim: true
  }
});

module.exports = mongoose.model('userOn',userOnSchema);
