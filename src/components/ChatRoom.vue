<template>
  <div>
    <div>
      <div class="d-f">
        <div class="v-l">
          <div style="padding-top: 20px; text-align: center; color: #fff;">在线用户</div>
          <ul class="bsb">
            <li v-for="(val,idx) in userList" :key="idx">{{val}}</li>
          </ul>
        </div>
        <div class="v-r bsb">
          <ul class="d-f f-d-c bsb" ref="chat"></ul>
        </div>
      </div>
      <div class="d-f f-d-c sends">
        <textarea v-model="txt" placeholder="ctrl+回车发送" ref="txt"></textarea>
        <button class="btnOn" ref="sends">发送</button>
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';
export default {
  name: 'ChatRoom',
  data () {
    return {
      userList:[]
      ,txt:''
    }
  },
  components:{},
  methods:{
    ioInit(){
      // 两种使用命名空间namespace的方式,第一种是重新起了一个socket服务,第二个还是同一个socket服务进程(可以看成是软隔离)
      // const socket = io.connect('http://localhost:7000/chatRoom',{path:'/chatRoom'});
      // const socket = io.connect('http://localhost:7000/chatRoom');
      // this.$store.commit('upSocket',io.connect('http://localhost:7000/chatRoom'));
      this.$store.commit('upSocket',io.connect(process.env.API_HOST+'chatRoom'));
      let socket = this.$store.state.socket;
      let userName = JSON.parse(localStorage.getItem('zhanlanblogUser')).name;

      socket.emit('user', {name:userName});
      socket.on('init', data => {
        if (data.connected && !data.disconnected) {
          // console.log('连接成功',data.chatArr);
          this.userList = data.chatArr;
        }
      });

      socket.on('push', msg => {
        if (this.userList.indexOf(msg.userName) === -1) {this.userList.push(msg.userName);}
        if (msg.userName) {this.$store.commit('updateMsg',`用户 ${msg.userName} 进入聊天室`);}
      });

      socket.on('disconnect', () => {
        // console.log('连接断开');// 自己离开聊天室
        this.$store.commit('updateMsg','已退出聊天室');
      });

      socket.on('disconnect1', (msg) => {
        // console.log(`用户 ${msg.name} 已退出聊天室`);// 其他用户离开聊天室
        let idx = this.userList.indexOf(msg.userName);
        if (idx !== -1) {this.userList.splice(idx, 1);}
        if (msg.userName) {this.$store.commit('updateMsg',`用户 ${msg.userName} 已退出聊天室`);}
      });

      socket.on('sends', (msg) => {
        let t1 = new Date();
        let t2 = t1.getFullYear() + "-" + (t1.getMonth()+1) + "-" + t1.getDate() + " " + t1.getHours() + ":" + t1.getMinutes() + ":" + t1.getSeconds();
        this.createLi(msg.txt,msg.name,true,t2);
      });

      let sends = () => {
        if (this.txt === '') {return this.$store.commit('updateMsg','请输入内容');}
        let t1 = new Date();
        let t2 = t1.getFullYear() + "-" + (t1.getMonth()+1) + "-" + t1.getDate() + " " + t1.getHours() + ":" + t1.getMinutes() + ":" + t1.getSeconds();
        this.createLi(this.txt,userName,false,t2);
        socket.emit('sends',{txt:this.txt,name:userName});
        this.txt = '';
      };

      let keyD = (e) => {
        if (e.ctrlKey && e.keyCode === 13) {sends()}
      };

      this.$refs.sends.addEventListener('click',sends);
      this.$refs.txt.addEventListener('keydown',keyD);
    },
    createLi(txt,name,broadcast,time){
      let li = document.createElement('li');
      let div = document.createElement('div');
      let div1 = document.createElement('div');
      let div2 = document.createElement('div');
      let div3 = document.createElement('div');
      li.style.display = 'flex';
      li.style.color = '#fff';
      li.style.paddingBottom = '10px';
      div.style.padding = '10px';
      div.style.borderRadius = '10px';
      div.style.lineHeight = '1.5';
      if (!broadcast) {
        div.style.marginLeft = 'auto';
        div.style.backgroundColor = '#2d3035';
      } else {
        div.style.marginRight = 'auto';
        div.style.backgroundColor = '#3f7da5';
      }
      div1.style.fontWeight = 'bold';
      div1.innerText = name;
      div2.innerText = time;
      div3.innerText = txt;
      div.appendChild(div1);
      div.appendChild(div2);
      div.appendChild(div3);
      li.appendChild(div);
      this.$refs.chat.appendChild(li);
    },
    loginOn(){
      this.$axios.post(process.env.API_HOST+'loginOn', {})
      .then(res => {
        this.$ifLogin(res,this,() => {this.ioInit();},() => {return this.$router.push('/');});
      })
      .catch(() => {
        let res = {error:1,msg:'网络异常，请稍后重试'};
        this.$ifLogin(res,this,() => {},() => {return this.$router.push('/');});
      });
    }
  },
  created(){
    if (!localStorage.zhanlanblogUser) {
      this.$ifLogin({error:4,msg:'请先登录'},this);
      return this.$router.push('/');
    }
  },
  mounted(){
    // this.$nextTick(() => {})
    this.loginOn();
  },
  computed:{},
  filters:{},
  watch:{
    // $route(to,from){}
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.v-l{
  width: 30%; height: 55vh;/*300*/ background-color: #2d3035; overflow: hidden;
  ul::-webkit-scrollbar-track {
    border-radius: 0.571rem; background-color: #2d3035;
  }
  ul{
    height: 100%; padding: 1.429rem;/*20*/ margin-left: 1.429rem;
    color: #ffffff; overflow-y: scroll; list-style: disc;
    li{padding-bottom: 0.714rem;/*10*/}
  }
}

.v-r{
  width: 70%; height: 55vh;/*300*/ border: 1px solid #b9b9b9; overflow: hidden;
  /*box-shadow: 0 0 1.5px 1.5px rgba(7,17,27,0.15);*/
  ul{height: 100%; padding: 1.429rem;/*20*/ overflow-y: scroll;}
}

.sends{
  padding-top: 1.071rem;/*15*/
  textarea{
    resize:none; box-sizing: border-box; height: 7.143rem;/*100*/
    padding: 0.714rem; border: 1px solid #b9b9b9;
  }
  button{
    margin-left: auto; margin-top: 0.714rem; width: 6.429rem;/*90*/ height: 2.143rem;/*30*/
    border-radius: 0.5rem;/*7*/ background-color: #0a7bc4; color: #fff;
  }
}

@media screen and (max-width: 767px){
  /*.v-l{display: none;}*/
}
</style>
