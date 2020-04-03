<template>
  <div>
    <iframe :src="src" frameborder="0"></iframe>
  </div>
</template>

<script>
export default {
  name: 'Demo',
  data () {
    return {
      src:''
    }
  },
  components:{},
  methods:{},
  created(){
    if (!this.$route.query.src) {return this.$router.go(-1);}
    // this.src = '#/usercenter';// iframe里也可以直接节奏vue页面
    this.src = this.$route.query.src;
  },
  mounted(){
    // this.$nextTick(() => {})
  },
  computed:{},
  filters:{},
  watch:{
    // $route(to,from){}
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
iframe{display: block; width: 100%; height: 100vh;}
</style>
