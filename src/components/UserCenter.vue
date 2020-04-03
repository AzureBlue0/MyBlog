<template>
  <div class="d-f xs-f-d-c">

    <div class="content b-shadow">
      <transition mode="out-in">
        <router-view></router-view>
      </transition>
    </div>

    <div class="side">
      <ul class="b-shadow">
        <router-link :to="{name:'Reply'}" tag="li">回复我的</router-link>
        <router-link :to="{name:'Own'}" tag="li">修改资料</router-link>
        <router-link v-if="admin" :to="{name:'Manage'}" tag="li">管理文章</router-link>
        <router-link v-if="admin" :to="{path:'/usercenter/Editor',query:''}" tag="li">发表文章</router-link>
      </ul>
    </div>

  </div>
</template>

<script>
export default {
  name: 'usercenter',
  data () {
    return {
      admin:false
    }
  },
  created(){
    if (localStorage.zhanlanblogUser) {
      if (JSON.parse(localStorage.zhanlanblogUser).uid === '5d6e26993dbb222cf888fc27') {
        this.admin = true;
      }
    }
  },
  mounted(){
    // this.$nextTick(()=>{})
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.content{order: 1; background-color: #fff;}
.side{
  order: 2; text-align: center;
  ul{background-color: #fff;}
  li{padding: 0.786rem 0; cursor: pointer;}
  li:hover{background: #4c4948; color: #fff;}
  /*li:nth-child(1):hover{background: #fff; color: #4c4948;}*/
}
@media screen and (max-width: 768px){
  .content{width: 75%; margin-right: 2%;}
  .side{width: 23%;}
}
@media screen and (max-width: 767px){
  .side{order: 1; width: 100%; text-align: center;}
  .content{order: 2; margin-top: 2.143rem;/*30*/ width: 100%; margin-right: 0;}
}
</style>
