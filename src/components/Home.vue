<template>
  <div class="d-f xm-f-d-c">

    <transition-group tag="div" class="content b-shadow" name="docList">

      <div class="docList d-f xs-f-d-c" v-for="(item,idx) in docArr" :key="'docList'+idx">
        <router-link :to="{path:'Doc',query:{docId:item._id}}" tag="div">
          <img :src="item.descImg" :alt="item.docTitle" :title="item.docTitle">
        </router-link>
        <div class="d-f f-d-c j-c-c">
          <router-link :to="{path:'Doc',query:{docId:item._id}}" tag="h3" class="t-o-e" :title="item.docTitle">
            {{item.docTitle}}
          </router-link>
          <div>
            <span>{{item.created | cTime}}</span>
            <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
            <span :title="item.docLabel">{{item.docLabel[0]}}</span>
          </div>
          <div>{{item.desc}}...</div>
        </div>
      </div>

      <ul class="page" :key="-1">
        <li v-for="(page,idx) in maxPage"
            :key="idx"
            @click.self="onPage(idx)"
            :class="nowPage === idx ? 'onPage' : ''">
          {{page}}
        </li>
      </ul>

    </transition-group>

    <div class="side">
      <div class="b-shadow">
        <h2>公告</h2>
        <h4 class="t-o-e" style="padding-bottom: 0.5rem;">IP：{{userIp}}</h4>
        <h4>感谢访问本站 (✪ω✪)</h4>
      </div>

      <div class="b-shadow labelObj">
        <h2>标签</h2>
        <span @click.self="docFilter(null)" style="color:#000;">全部</span>
        <span v-for="(col,idx) in labelObj"
              :key="idx"
              @click.self="docFilter(idx)"
              :style="{color:col}">
          {{idx}}
        </span>
      </div>

      <div class="b-shadow">
        <h2>最新文章</h2>
        <router-link v-for="(item,idx) in newDocArr.slice(0, 5)"
                     :to="{path:'/Doc',query:{docId:item._id}}"
                     class="d-f newDoc"
                     tag="div" :key="idx">
          <img :src="item.descImg" width="60" height="60" :alt="item.docTitle">
          <div class="d-f f-d-c">
            <div>{{item.docTitle}}</div>
            <time>{{item.updated | cTime}}</time>
          </div>
        </router-link>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      userIp:''
      ,labelObj:{}
      ,docArr:[]
      ,maxPage:0
      ,nowLabel:''
      ,newDocArr:[]
    }
  },
  methods:{
    docFilter(label){
      this.$store.commit('upNowPage',0);
      this.nowLabel = label;
      this.$axios.post(process.env.API_HOST+'docList',{label})
      .then(res => {
        this.$ifLogin(res,this,() => {
          this.docArr = res.data;
          this.maxPage = res.maxPage;
        });
      })
      .catch(() => {this.$store.commit('updateMsg','网络异常，请稍后重试');})
    },
    onPage(page){
      if (this.nowPage === page || this.maxPage < 2) {return false}
      this.$store.commit('upNowPage',page);
      if (this.nowLabel === '') {this.nowLabel = undefined;}
      this.getDocList();
    },
    getDocList(){
      this.$axios.post(process.env.API_HOST+'docList',{page:this.nowPage,label:this.nowLabel})
      .then(res => {
        this.$ifLogin(res,this,() => {
          this.docArr = res.data;
          this.maxPage = res.maxPage;
          if (res.info) {
            let len = res.info.length;
            for (let i=0; i < len; i++) {
              res.info[i].sortId = i+1;
            }
            this.newDocArr = res.info.reverse();// reverse()颠倒数组中元素的顺序,改变原数组,不创建新数组
          }
          if (res.userIp) {this.userIp = res.userIp.match(/\d+\.\d+\.\d+\.\d+/)[0];}
        });
      })
      .catch(() => {this.$store.commit('updateMsg','网络异常，请稍后重试');})
    }
  },
  computed:{
    nowPage(){
      return this.$store.state.nowPage
    }
  },
  created(){
    // console.log(this.$root.$children[0]);
    this.$router.push('/');
    this.$axios.get('/static/mock/label.json')
    .then(res => {
      this.labelObj = res;
    })
  },
  mounted(){
    this.$nextTick(()=>{
      this.getDocList();
    })
  },
  filters:{
    cTime: val => {
      let t1 = new Date(val);
      return t1.getFullYear() + "-" + (t1.getMonth()+1) + "-" + t1.getDate();
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.content{padding: 0; box-shadow:unset!important;}
.content .docList:nth-child(odd) > div:nth-child(1){order: 1;}
.content .docList:nth-child(odd) > div:nth-child(2){order: 2;}
.content .docList:nth-child(even) > div:nth-child(1){order: 2;}
.content .docList:nth-child(even) > div:nth-child(2){order: 1;}
.content .docList:nth-child(1){margin-top: 0;}
.docList:hover img{transform: scale(1.1);}
.docList{
  margin-top: 1.429rem;/*20*/
  border-radius: 0.571rem;/*8*/
  box-shadow: 0 0 1.5px 1.5px rgba(7,17,27,0.15);
  transition: all 0.3s;
  overflow: hidden;
  > div:nth-child(1){width: 45%; overflow: hidden; cursor: pointer;}
  > div:nth-child(2){
    flex: 1; padding: 0 2.857rem;/*40*/ overflow: hidden;
    h3{font-size: 24px; color: #2e2e2e; cursor: pointer; transition: color 0.3s;}
    > div:nth-child(2){margin: 0.929rem 0 0.714rem;/*13 10*/}
    > div:nth-child(3){text-align: justify; line-height: 2;}
  }
  img{width:100%; transition: all 0.6s;}
}
.docList:hover{box-shadow: 0 0 12px 12px rgba(7,17,27,0.15);}
.docList:hover h3{color: #49b1f5!important;}
@media screen and (max-width: 1024px){
  .docList{padding: 10px 0; align-items: center;}
  .docList > div:nth-child(2) h3{font-size: 20px; line-height: 1.2;}
}
@media screen and (max-width: 767px){
  .content .docList:nth-child(even) > div:nth-child(1){order: 1;}
  .content .docList:nth-child(even) > div:nth-child(2){order: 2;}
  .docList{padding: 0;}
  .docList > div:nth-child(1){width: 100%;}
  .docList > div:nth-child(2){padding: 1.429rem;/*20*/}
}

.side > div{margin-top: 1.429rem;/*20*/}
.side > div:nth-child(1){margin-top: 0;}
.side h2{padding-bottom: 0.571rem;/*8*/ font-size: 16px; line-height: 1.5;}
.labelObj span{margin-right: 0.714rem;/*10*/ padding-left: 0; padding-right: 0; border: 0;}
.newDoc{
  margin-bottom: 18px; cursor: pointer;
  > img{object-fit: cover; min-width: 60px; min-height: 60px;}
  > div{
    padding-left: 10px; transition: color 0.3s;
    > div{
      display: -webkit-box; max-height: 41px; line-height: 1.5; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden;
    }
    time{margin-top: auto; font-size: 12px;}
  }
}
.newDoc:hover > div {color: #49b1f5;}

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
  li.onPage{background: #49b1f5;}
}

.docList-enter{opacity:0;transform: translate(0px,-50px);}
.docList-leave-active {opacity:0;transform:translate(0px,-50px);}
</style>
