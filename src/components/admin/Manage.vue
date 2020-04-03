<template>
  <div class="Manage">
    <ul>
      <li v-for="(val,idx) in docTitleArr" :key="idx" @click.self="openEditor(val._id)">
        {{val.docTitle}}
        <span @click.self="delDoc($event,val._id)">删除</span>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: 'Manage',
    data () {
      return {
        docTitleArr:[]
      }
    },
    methods:{
      openEditor(docId){
        this.$router.push({path:'/usercenter/Editor',query:{docId}});
      },
      delDoc(e,docId){
        this.$axios.post(process.env.API_HOST+`ManageDoc/delDoc`,{docId})
        .then(res => {
          this.$ifLogin(res,this,() => {
            this.$store.commit('updateMsg',res.msg);
          });
          e.target.parentNode.parentNode.removeChild(e.target.parentNode);
        })
        .catch(() => {this.$store.commit('updateMsg','网络异常，请稍后重试');})
      }
    },
    created(){
      this.$axios.post(process.env.API_HOST+`ManageDoc`)
      .then(res => {
        this.$ifLogin(res,this,() => {
          this.docTitleArr = res.data;
        });
      })
      .catch(() => {this.$store.commit('updateMsg','网络异常，请稍后重试');})
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.Manage{
  li{
    display: flex;
    flex-direction: column;
    padding: 0.357rem 0;
    border-bottom: 1px solid #a1a1a1;
    line-height: 1.5;
    span{margin-left: auto; padding: 0 0.714rem; color: #dc143c; cursor: pointer;}
  }
}
/*@media screen and (max-width: 767px){
}*/
</style>
