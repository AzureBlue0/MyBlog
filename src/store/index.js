import Vue from 'vue'
import Vuex from 'vuex'
// import axios from 'axios'
Vue.use(Vuex)
export default new Vuex.Store({
    state:{ // state 存放所有组件都可以使用的数据
        loginUser:JSON.parse(localStorage.getItem('zhanlanblogUser')) // 直接读取本地数据
        // ,userList:JSON.parse(localStorage.getItem('userlist'))
        ,msgRef:{}
        ,msg:''
        ,loginOn:false
        ,logoSrc:localStorage.zhanlanblogUser ? JSON.parse(localStorage.getItem('zhanlanblogUser')).logoSrc : '/static/logo.jpg'
        ,socket:{}
        ,nowPage:0
    },
    mutations:{ // mutations是放置一些同步修改state数据的方法
        saveLoginUser(state,value){
          state.loginUser = value;
          localStorage.setItem('zhanlanblogUser',JSON.stringify(value)); // 为了防止刷新后这个数据就清空,更改数据后把数据存到本地
        }
        ,reLoginUser(state){
          state.loginUser = {};
        }
        /* ,saveUserList(state,users){
          state.userList = users;
        } */
        ,saveMsgRef(state,value){
          state.msgRef = value;
        }
        ,updateMsg(state,value){
          state.msg = value;

          if(!state.msgRef.classList.contains('msg-on')){
            state.msgRef.classList.toggle('msg-on');
          }
          setTimeout(()=>{
            if(state.msgRef.classList.contains('msg-on')){
              state.msgRef.classList.toggle('msg-on');
            }
          },2000);
        }
        ,updateLoginOn(state){
          state.loginOn = !state.loginOn;
        }
        ,upLogoSrc(state,value){
          state.logoSrc = value;
        }
        ,upNowPage(state,value){
          state.nowPage = value * 1;
        }
        ,upSocket(state,value){
          state.socket = value;
        }
        ,reSocket(state){
          if (state.socket.disconnect) {state.socket.disconnect();}
          state.socket = {};
        }
    },
    actions:{ // 放置异步修改state数据的方法
        /* getUserList(thisStore){
            return new Promise((resolve,reject)=>{
                axios.get('/api/userlist').then(users=>{
                    // 在actions的函数里再触发mutations里的同步方法修改state中的数据
                    thisStore.commit('saveUserList',users.data);
                    // 修改完也是要把数据存到本地,不然也是页面一刷新数据就没了
                    localStorage.setItem('userlist',JSON.stringify(users.data));
                    resolve();
                })
            })
        } */
    },
    getters:{ // getters算是vuex的计算属性,计算state中的数据
        // newMsg:state=>state.msg
        /* oldUser:(state)=>{
            // 用js的filter方法过滤用户中的大龄用户,箭头函数直接return
            return state.userList.filter(user=>user.age>=30);
        },
        newUser:state=>state.userList.filter(user=>user.age<30) */
    }
    // 组件里使用getters里的属性this.tableData = this.$store.getters.newUser
})
