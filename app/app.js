const
    express = require('express')
    ,mongoose = require('mongoose')
    ,bodyParser = require('body-parser')
    // ,path = require("path")
    // ,fs = require("fs")
    ,app = express()
    ,http = require('http').Server(app)
    // ,io = require('socket.io')(http,{path:'/chatRoom'})
    ,io = require('socket.io')(http)
;
// console.log(__dirname,path.join(__dirname,"/ssl/1_www.zhanlan.ink_bundle.crt"));
/*let httpOptions = {
  key : fs.readFileSync(path.join(__dirname,"/ssl/2_www.zhanlan.ink.key")),
  cert : fs.readFileSync(path.join(__dirname,"/ssl/1_www.zhanlan.ink_bundle.crt"))
};
const https = require('https').Server(httpOptions,app);
// const io = require('socket.io')(https,{path:'/chatRoom'})
const io = require('socket.io')(https);*/

// app.use(express.static(__dirname + "./routers/upload"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, uid, Accept, X-Requested-With , yourHeaderFeild');
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS,PATCH");
  res.header("X-Powered-By", ' 3.2.1');
  res.header("Content-Type", "application/json;charset=utf-8");
  // res.header("Access-Control-Max-Age",1728000);// 预请求保存20天
  next();
});

// error:1是各种错误,2是账号在别处登录,3是非管理员登录,4是登录过期
require('./routers/loginUse')(app);

// 登录路由
app.use('/login',require('./routers/login'));// 用use或post都一样
// 注册路由
app.use('/reset',require('./routers/reset'));
// 上传文章图片
app.use('/upMdImg',require('./routers/upMdImg'));
// 上传文章
app.use('/upDoc',require('./routers/upDoc'));
// 文章管理读取删除
app.use('/ManageDoc',require('./routers/ManageDoc'));
app.use('/ManageDoc/loadDoc',require('./routers/ManageDoc'));
app.use('/ManageDoc/delDoc',require('./routers/ManageDoc'));
// 修改用户资料
app.use('/reUserInfo',require('./routers/reUserInfo'));
// 文章列表与内容与评论
require('./routers/docLoad')(app);

// 聊天室
let chatArr = [];
// of('/chatRoom')这个是命名空间,房间是监听到连接后socket.join('房间名',回调),离开是socket.leave('房间名',回调)
// 给命名空间内的人广播(包括发送者)是io.of('命名空间名').emit ,房间是io.to('房间名').emit ,socket.emit 单人发送(发送者)
// 广播的时候是以namespace为单位的,io.emit后面不指定of或to的话就给默认的namespace和默认room广播,默认的namespace就是'/'
// 给命名空间内的指定房间广播io.of('namespace').in('room').emit()
// 给房间内的人广播还有io.sockets.in('room').emit(),io.sockets没有of只有in,只能给默认命名空间下的房间发

// socket.broadcast.emit这个广播是发送给除了发送者外的所有人(命名空间内,房间外)
// 通过socket广播时,是广播给这个socket所属的namespace里的所有客户端,socket.broadcast后面可以加in
// socket.broadcast后也可以加to(id)发送给默认房间,但前面的socket.on的回调的参数要改成id,msg

// 记忆这些函数也比较容易,如果是socket开头的,那么namespace已经指定,只能修改room,如果是io开头的,那么可以指定namespace和room
io.of('/chatRoom').on('connection', socket => { // socket.io连接成功
  socket.on('user', user => {
    // socket里的clientsCount应该是统计连接数量
    if (chatArr.indexOf(user.name) === -1) {
      chatArr.push(user.name); socket.userName = user.name;
      socket.emit('init', {connected:socket.connected,disconnected:socket.disconnected,chatArr});
      socket.broadcast.emit('push', {userName:socket.userName});
    }
  });
  // socket连接断开
  socket.on('disconnect', (a) => {
    // console.log(a,socket.userName);// a:transport close,正常断开是client namespace disconnect
    let idx = chatArr.indexOf(socket.userName);
    if (idx !== -1) {chatArr.splice(idx, 1);}
    socket.broadcast.emit('disconnect1', {userName:socket.userName});
  });
  socket.on('sends', data => {
    socket.broadcast.emit('sends', data);
  });
});

// 全部完成后要记得把docLoad的修改阅读数和前端Reply.vue的评论更新状态打开,还有jwt里的有效时间

// 启动数据库
mongoose.connect('mongodb://localhost:27017/myblog',{useNewUrlParser:true},(err)=>{
    if(err){console.log('数据库链接失败');return;}
    // app.listen(7000,()=>{console.log('7000端口监听成功');});
    http.listen(7000,()=>{console.log('7000端口监听成功');});
    console.log('数据库链接成功');
});
