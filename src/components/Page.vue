<template>
  <ul class="page">
    <router-link tag="li"
                 v-for="(page,idx) in maxPage"
                 :key="idx"
                 :to="{path:'/',query:{page:idx}}">
      {{page}}
    </router-link>
  </ul>
</template>

<script>
export default {
  name: 'Page',
  props:['maxPage'],
  data () {
    return {
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.page{
  padding:1.429rem;/*20*/
  text-align:center;
  li{
    display: inline-block;
    width: 2.143rem;/*30*/
    height: 2.143rem;
    margin:0.357rem;/*5*/
    line-height: 30px;
    background: #555;
    text-align: center;
    color:#fff;
    cursor: pointer;
  }
  li.router-link-exact-active{background: #49b1f5;}
}
</style>
