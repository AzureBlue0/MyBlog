<template>
  <div>
    <div class="content d-f f-d-c">
      <router-link class="demoList xs-f-d-c" tag="a" v-for="(item,idx) in demoList"
                   :to="{path:'/Demo',query:{src:item.href}}" :style="{order:item.id*1}" :key="'demo'+idx">
        <div><img :src="item.img" :alt="item.name"></div>
        <div class="d-f f-d-c j-c-c">
          <div>{{item.name}}</div>
          <!--<div>{{item.name}}</div>-->
        </div>
      </router-link>
      <router-link class="demoList xs-f-d-c" tag="a" v-for="(item,idx) in demoList1"
                   :to="{path:'/Demo1'}" :style="{order:item.id*1}" :key="'demo1'+idx">
        <div><img :src="item.img" :alt="item.name"></div>
        <div class="d-f f-d-c j-c-c">
          <div>{{item.name}}</div>
          <!--<div>{{item.name}}</div>-->
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
// 上面第一个router-link是跳到普通demo页,第二个是跳到有threeJS的demo页
// target="_blank"
import {getHome} from '@/api'

export default {
  name: 'DemoRoom',
  data () {
    return {
      demoList:[]
      ,demoList1:[]
    }
  },
  methods:{
    async getData(){
      // let {data:{data:{demoList}}} = await getHome();
      let {data:{demoList}} = await getHome();
      let {data:{demoList1}} = await getHome();
      this.demoList = demoList;
      this.demoList1 = demoList1;
    }
  },
  created(){
    this.getData();
  },
  mounted(){
    // this.$nextTick(() => {})
  },
  computed:{},
  watch:{
    // $route(to,from){}
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.content{padding: 0; box-sizing: border-box;}
.content .demoList:nth-child(odd) > div:nth-child(1){order: 1;}
.content .demoList:nth-child(odd) > div:nth-child(2){order: 2;}
.content .demoList:nth-child(even) > div:nth-child(1){order: 2;}
.content .demoList:nth-child(even) > div:nth-child(2){order: 1;}
.demoList{
  display: flex; margin-bottom: 2.5rem;/*35*/ border-radius: 0.571rem;
  background-color: #fff; color: #4c4948;
  box-shadow: 0 0 1.5px 1.5px rgba(7, 17, 27, 0.15); transition: all 0.3s;
  overflow: hidden;
  div{overflow: hidden;}
  > div:nth-child(1){width: 45%;}
  > div:nth-child(2){flex: 1; padding: 0 2.857rem;/*40*/}
  > div:nth-child(2) > div:nth-child(1){font-size: 24px; font-weight: bold;}
  > div:nth-child(2) > div:nth-child(2){padding-top: 0.714rem; text-align: justify; line-height: 2;}
  img{width: 100%; transition: all 0.6s;}
}
.demoList:hover{box-shadow: 0 0 12px 12px rgba(7,17,27,0.15);}
.demoList:hover img{transform: scale(1.1);}

@media screen and (max-width: 767px){
  .demoList{
    > div:nth-child(1){width: 100%;}
    > div:nth-child(2){padding: 1.429rem;/*20*/}
  }
}
</style>
