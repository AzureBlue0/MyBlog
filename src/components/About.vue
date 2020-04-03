<template>
  <div>
    <div class="b-shadow" style="background-color: #fff;">
      <iframe ref="about" src="/static/demo/about.html" frameborder="0"></iframe>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About',
  data () {
    return {
      ifmDom:[]
    }
  },
  components:{},
  methods:{
    ifmReSize(){
      if (this.ifmDom.length === 0) {return}
      let bHeight = this.ifmDom[0].contentWindow.document.body.scrollHeight;
      let dHeight = this.ifmDom[0].contentWindow.document.documentElement.scrollHeight;
      let height = Math.min(bHeight, dHeight);
      this.ifmDom[0].height = height+20;
    },
  },
  created(){},
  mounted(){
    this.ifmDom.push(this.$refs.about);
    this.ifmDom[0].contentWindow.onload = () => {
      this.ifmReSize();
    };
    window.addEventListener('resize',this.ifmReSize,true);
    // this.$nextTick(() => {})
  },
  destroyed(){
    window.removeEventListener("resize",this.ifmReSize,true);
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
iframe{display: block; width: 100%;}
</style>
