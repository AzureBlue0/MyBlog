<template>
  <div class="reply">
    <div class="t1" @click="userCmt(false)">未读回复&nbsp;&nbsp;+</div>
    <div style="padding-top: 20px;">
      <ul>
        <li class="d-f a-i-c" v-for="(item,idx) in cmtF" :key="idx" style="margin-bottom: 20px;">
          <img :src="item._id.puid1[0].userInfo.photo" :alt="item._id.puid1[0].username" height="40" style="border-radius: 50%;">
          <router-link target="_blank" :to="{path:'/Doc',query:{docId:item._id.did[0]._id,cmtId:item._id._id}}" style="display: block; flex: 1; margin-left: 7px; padding: 7px; background-color: #e1e1e1; color: #4c4948;">
            <div>
              <span class="uName">{{item._id.puid1[0].username}}</span>
              &nbsp;&nbsp;&nbsp;{{item._id.created | cTime}}
            </div>
            <div class="markdown-body v-note-wrapper" v-html="item._id.content" style="padding-top: 10px;"></div>
          </router-link>
        </li>
      </ul>
    </div>

    <div class="t1" @click="userCmt(true)">全部回复&nbsp;&nbsp;+</div>
    <div style="padding-top: 20px;">
      <ul>
        <li class="d-f a-i-c" v-for="(item,idx) in cmtT" :key="idx" style="margin-bottom: 20px;">
          <img :src="item._id.puid1[0].userInfo.photo" :alt="item._id.puid1[0].username" height="40" style="border-radius: 50%;">
          <router-link target="_blank" :to="{path:'/Doc',query:{docId:item._id.did[0]._id,cmtId:item._id._id}}" style="display: block; flex: 1; margin-left: 7px; padding: 7px; background-color: #e1e1e1; color: #4c4948;">
            <div>
              <span class="uName">{{item._id.puid1[0].username}}</span>
              &nbsp;&nbsp;&nbsp;{{item._id.created | cTime}}
            </div>
            <div class="markdown-body v-note-wrapper" v-html="item._id.content" style="padding-top: 10px;"></div>
          </router-link>
        </li>
      </ul>
    </div>

    <mavon-editor style="display: none;" codeStyle="gruvbox-dark"/>
  </div>
</template>

<script>
  export default {
    name: "Reply",
    data () {
      return {
        cmtF:[]
        ,cmtT:[]
        ,oldTime:0
      }
    },
    methods:{
      userCmt(state){
        // 节流判断
        if(new Date() - this.oldTime < 2000){return this.$store.commit('updateMsg','请勿频繁请求');}
        this.oldTime = new Date();
        this.$axios.post(process.env.API_HOST+'userCmt',{state})
        .then(res => {
          this.$ifLogin(res,this,() => {
            if (state) {
              this.cmtT = res.data;
            } else {
              this.cmtF = res.data;
              /*let len = res.data.length;
              this.$axios.post(process.env.API_HOST+'userCmtUp',{len})
              .then(res1 => {this.$ifLogin(res1,this);})
              .catch(() => {this.$store.commit('updateMsg','网络异常，请稍后重试');});*/
            }
          });
        })
        .catch(() => {this.$store.commit('updateMsg','网络异常，请稍后重试');});
      }
    },
    filters:{
      cTime: val => {
        let t1 = new Date(val);
        return t1.getFullYear() + "-" + (t1.getMonth()+1) + "-" + t1.getDate();
      }
    },
    created(){
    },
    mounted(){
      // this.$nextTick(()=>{})
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.reply .markdown-body{border: none; font-size: 14px; background-color: unset;}
.reply .v-note-wrapper{min-width: auto; min-height: auto;}
.t1{
  padding: 0.5rem 0; border-radius: 12px;
  text-align: center; font-size: 16px; font-weight: bold; cursor: pointer;
  background-color: #d2d2d2;
}
.uName{font-weight: bold; color: #0a7bc4;}
</style>
