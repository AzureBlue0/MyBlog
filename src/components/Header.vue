<template>
  <nav ref="nav" :class="inHome?'nav-vh':'nav-0'">
    <div class="headbg bsb" ref="headbg" :class="navOn?'xs-height':''"
         :style="inHome?'background-color:unset;':'background-color:#2D3035;'">
      <div class="head d-f" :class="navOn?'xs-height':''" @click.self="hanbao">

        <div class="logo">
          <router-link :to="{name:'home'}" tag="a">
            <img :src="logoSrc" id="logo" alt="喵喵屋" title="喵喵屋">
            <span>喵喵屋</span>
          </router-link>

          <div>
            <span class="hanbao" ref="hbbtn" @click.self="hanbao"></span>
          </div>
        </div>

        <div class="nav" :class="navOn?'xs-nav':''">
          <ul class="d-f">
            <li>
              <router-link :to="{name:'home'}" tag="a">首页</router-link>
            </li>
            <li>
              <a @click.self="down1">文章</a>
            </li>
            <li v-for="(item,index) in columnList" :key="index">
              <router-link :to="{name:item.href}" tag="a">{{item.name}}</router-link>
            </li>
          </ul>
          <ul v-show="!loginOn" class="d-f">
            <li><a @click.self="login">登录</a></li>
            <li><a @click.self="login">注册</a></li>
          </ul>
          <ul v-show="loginOn" class="d-f">
            <li><router-link :to="{name:'usercenter'}" tag="a">个人中心</router-link></li>
            <li><a @click="logout">退出</a></li>
          </ul>
          <ul class="d-f">
            <li>
              <router-link :to="{name:'About'}" tag="a">关于博客</router-link>
            </li>
          </ul>
        </div>

      </div>
    </div>

    <div class="loginbg" ref="login" @click.self="login">
      <div class="login d-f f-d-c j-c-c" @keyup.enter="submitForm(form1)">
        <div class="username">
          <div class="d-f a-i-c">
            <span>昵称：</span>
            <input type="text" ref="uInput" v-model="form1.username" @blur="verify(form1)">
          </div>
          <div class="tips" ref="tips1">{{tips.t1}}</div>
        </div>
        <div class="password">
          <div class="d-f a-i-c">
            <span>密码：</span>
            <input type="password" v-model="form1.password" @blur="verify(form1)">
          </div>
          <div class="tips" ref="tips2">{{tips.t2}}</div>
        </div>
        <div class="d-f">
          <button class="btnOn" @click="submitForm(form1)">登录</button>
          <button class="btnOn" @click="resetForm(form1)">注册</button>
        </div>
      </div>
    </div>

    <div class="down" @click.self="down">
      <i @click.self="down">▼</i>
    </div>

  </nav>
</template>

<script>
import {getHome} from '@/api'

export default {
  name: 'Header',
  data () {
    return {
      headBgDom:{}
      ,navOn:false
      ,columnList:[]
      ,form1:{
        username:''
        ,password:''
      }
      ,tips:{
        t1:'请输入2到8位的英文/数字/下划线/中文'
        ,t2:'请输入6到18位的英文/数字/英文符号'
      }
      ,oldTime:0
    }
  },
  created(){
    this.getData();
    if (localStorage.zhanlanblogUser) {
      this.$axios.post(process.env.API_HOST+'loginOn', {})
      .then(res => {
        this.$ifLogin(res,this,() => {
          this.$store.commit('updateLoginOn');
        });
      })
      .catch(() => {
        let res = {error:1,msg:'网络异常，请稍后重试'};
        this.$ifLogin(res,this);
      });
    }
  },
  mounted(){
    this.headBgDom = this.$refs.headbg;
    window.addEventListener('scroll',this.scrollEvent,true);
  },
  destroyed(){
    window.removeEventListener("scroll",this.scrollEvent,true);
  },
  methods: {
    scrollEvent(){
      // if (!this.inHome) {return}
      let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      let judge = this.inHome ? 'unset' : '#2d3035';
      if (scrollTop >= 200) {
        this.headBgDom.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
      } else {
        this.headBgDom.style.backgroundColor = judge;
      }
    },
    async getData(){
      // let {data:{data:{columnList}}} = await getHome();
      let {data:{columnList}} = await getHome();
      this.columnList = columnList;
    },
    hanbao(){
      if(window.screen.width>767){return false;}
      this.$refs.hbbtn.classList.toggle('hanbao-on');
      this.navOn = !this.navOn;
    },
    login(){
      this.$refs.login.classList.toggle('login-on');
      if (this.$refs.login.classList.contains('login-on')) {
        this.$refs.uInput.focus();
      }
    },
    logout(){
      this.$axios.post(process.env.API_HOST+'logout',{
        uid:JSON.parse(localStorage.zhanlanblogUser).uid
      }).then(() => {
        this.$store.commit('updateMsg','注销成功');
        this.logouts();
      }).catch(() => {
        this.$store.commit('updateMsg','注销成功');
        this.logouts()
      });
    },
    logouts(){
      if (this.$route.matched[0].name === 'usercenter' || this.$route.matched[0].name === 'ChatRoom') {
        this.$router.push('/');
      }
      if (localStorage.zhanlanblogUser) {
        localStorage.removeItem('zhanlanblogUser');
      }
      if (this.$store.state.loginOn === true) {
        this.$store.commit('updateLoginOn');
      }
      this.$store.commit('reLoginUser');
      this.$store.commit('upLogoSrc','/static/logo.jpg');
    },
    down(){
      let navH = window.screen.width < 767 ? 70.56 : 64.59;
      document.documentElement.scrollTop = document.querySelector('.body').offsetTop - navH;
    },
    down1(){
      this.$router.push('/');
      let cDown = setInterval(() => {
        if (document.documentElement.scrollHeight >= 863) {
          this.$nextTick(() => {this.down();});
          clearInterval(cDown);
        }
      },200);
    },
    verify(val){
      if(!/^[\d_a-z\u4e00-\u9fa5]{2,8}$/i.test(val.username)){
        this.$refs.tips1.style.color = 'red';return false;
      }else{
        this.$refs.tips1.style.color = 'green';
      }
      if(!/^[\da-z_,/!@#\$%\^&*()+\-=\[\]{}\.<>?]{6,18}$/i.test(val.password)){
        this.$refs.tips2.style.color = 'red';return false;
      }else{
        this.$refs.tips2.style.color = 'green';
      }
      return true;
    },
    submitForm(val){
      if(new Date() - this.oldTime < 2000){return;}
      this.oldTime = new Date();
      if(!this.verify(val)){return false;}
      this.$axios.post(process.env.API_HOST+'login',{
        username:val.username
        ,password:val.password
      }).then(res => {
        this.$ifLogin(res,this,() => {
          this.$store.commit('updateMsg',res.msg);
          this.$store.commit('saveLoginUser',{
            name:this.form1.username,uid:res.uid,token:res.token,logoSrc:res.photo
          });
          this.$store.commit('upLogoSrc',res.photo);
          this.$store.commit('updateLoginOn');
          this.login();
          this.form1.username = '';this.form1.password = '';
        });
      })
      .catch(() => {
        this.$store.commit('updateMsg','网络异常，请稍后重试');
      });
    },
    resetForm(val){
      if(new Date() - this.oldTime < 2000){return;}
      this.oldTime = new Date();
      if(!this.verify(val)){return false;}
      this.$axios.post(process.env.API_HOST+'reset',{
        username:val.username
        ,password:val.password
      }).then(res => {
        this.$store.commit('updateMsg',res.msg);
        this.form1.username = '';this.form1.password = '';
      })
      .catch(() => {
        this.$store.commit('updateMsg','网络异常，请稍后重试');
      });
    }
  },
  computed:{
    loginOn(){
      return this.$store.state.loginOn
    },
    logoSrc(){
      return this.$store.state.logoSrc
    },
    inHome(){
      return this.$route.matched[0] && this.$route.matched[0].path === '' ? true : false;
    }
  },
  watch:{
    '$route' (to, from) {}
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang='scss' scoped>
.nav-vh{height: 100vh;}
.nav-0{height: 0;}
nav{
  position: relative;
  min-height: 4.614rem;/*64.59*/
  height: 100vh;
  background-image: url("/static/bg/nav1.jpg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% auto;
  background-attachment: fixed;
}
@media screen and (max-width:1024px){
  nav{height: 53.571rem; background-position: top center; background-size: unset;}
  .nav-vh{height: 53.571rem;}
}
@media screen and (max-width:767px){
  nav{height: 100vh; min-height: 5.04rem;/*70.56*/ background-position: center;}
  .nav-vh{height: 100vh;}
}
.headbg{
  position: fixed;
  z-index: 5;
  width: 100%;
  transition: background-color .5s;
  /*background-color: #2D3035;*/
  /*background-color: rgba($color: #000, $alpha: 0.6);*/
  color: #fff;
  a{color: #fff;}
  .head{
    box-sizing: border-box;
    align-items: center;
    padding: .714286rem 2.571429rem;
    .logo{
      display: flex;
      box-sizing: border-box;
      #logo{
        object-fit: cover; max-width: 3.571429rem;/*50*/
        min-height: 3.571429rem; max-height: 3.571429rem; border-radius: 50%;
      }
      a{display: flex; align-items: center;
        span{padding-left: 1.429rem; font-size: 17px; font-weight: bold;}
      }
      div{display: none;}
    }
    .nav{
      display: flex; margin-left: auto;
      li{
        margin-left: 2.142857rem;
        a{cursor: pointer;}
      }
    }
  }
}

.xs-height{
  height: 100%; background-color: rgba($color: #000, $alpha: 0.4);
  .logo{background-color: #2D3035;}
}
.xs-nav{display: block!important; flex: 1; animation: xsNav .4s 1;}
@keyframes xsNav{
  0%{margin-left: -50%;}
  100%{margin-left: 0;}
}

@media screen and (max-width:767px){
  .headbg{
    width: 100%;
    .head{
      flex-direction: column;
      align-items: unset;
      padding: 0;
      .logo{
        align-items: center;
        padding: .928571rem;/*13*/
        /*background-color: #2D3035;*/
        div{display: block; margin-left: auto;}
      }
      .nav{
        display: none; flex-direction: column; margin-left: 0; padding-top: 1.428571rem; width: 40%; background-color: #2A2A2A;
        ul{
          flex-direction: column;
          li{
            margin-left: 0; padding-bottom: 1.428571rem;
            a{display: block; padding-left: 1.428571rem;}
          }
        }
      }
    }
  }
}

.down{
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 3.571rem;/*50*/
  text-align: center;
  cursor: pointer;
  i{
    position: absolute;
    display: inline-block;
    font-size: 22px;
    color: #fff;
    animation: pulse 1.5s infinite;
    cursor: pointer;
  }
}
@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
    -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=40)";
    filter: alpha(opacity=40);
    top: 0;
  }
  50% {
    opacity: 1;
    -ms-filter: none;
    filter: none;
    top: -1.143rem;/*16*/
  }
}
</style>
