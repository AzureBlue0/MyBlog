<template>
  <div>

    <div class="d-f">
      <div class="content b-shadow" ref="docContent" style="height: 80vh;">
        <div class="docDesc" :style="{backgroundImage:'url('+doc.descImg+')'}">
          <div>
            <h1>{{doc.docTitle}}</h1>
            <div>
              <span>发表于 {{doc.created | cTime}}</span>
              <span>&nbsp;|&nbsp;</span>
              <span>更新于 {{doc.updated | cTime}}</span>
              <div>
                标签：<span v-for="(item,idx) in doc.docLabel" :key="idx">&nbsp;{{item}}&nbsp;</span>
                <span>&nbsp;|&nbsp;</span>
                <span>阅读量：{{doc.readNum}}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="showMD v-note-wrapper markdown-body" ref="md1" v-html="doc.mdHtml"></div>
      </div>

      <div class="side" ref="side2">
        <div class="docNav b-shadow" ref="docNav" style="height: 80vh;">
          <div>目录</div>
        </div>
      </div>

      <div class="onside" @click="onSide">目<br>录</div>
    </div>

    <div class="turnBtn d-f f-d-c">
      <span class="bsb" @click="prevOn(prev._id)" :title="prev.docTitle">
        上一篇：{{prev.docTitle | cTitle}}
      </span>
      <span class="bsb" @click="nextOn(next._id)" :title="next.docTitle">
        下一篇：{{next.docTitle | cTitle}}
      </span>
    </div>

    <div class="comment">

      <div class="tit" ref="cmtTop">评论</div>
      <mavon-editor ref="md2" class="md2"
                    :placeholder="placeholder"
                    :toolbars="mdOption"
                    :subfield="true"
                    :navigation="false"
                    codeStyle="gruvbox-dark"
                    :autofocus="false"/>
      <div class="d-f">
        <span class="btnOn" @click="resetBtn()" style="margin-left: auto;">重置</span>
        <span class="btnOn" @click="commentBtn()" style="margin-left: 21px;">发表</span>
      </div>

      <div class="cmt d-f" v-for="(cmt,idx) in cmtArr" :key="idx" :id="cmt._id">
        <img :src="cmt.uid.userInfo.photo" height="45" :alt="cmt.uid.username" style="border-radius: 50%;">
        <div style="flex: 1;">

          <div style="line-height: 2; font-weight: bold; color: #0a7bc4;">{{cmt.uid.username}}</div>
          <div class="d-f a-i-c">
            <span>{{cmt.created | cTime}}</span>
            <span class="btnOn1" @click="btn1(cmt.uid,cmt._id,cmt.uid.username,idx)">回复</span>
          </div>
          <div class="v-note-wrapper markdown-body" v-html="cmt.content" style="padding: 5px 0 10px;"></div>

          <ul>
            <li class="cmt d-f" v-for="(child,index) in cmt.child" :key="index" :id="child._id">
              <img :src="child.uid.userInfo.photo" height="45" :alt="child.uid.username" style="border-radius: 50%;">
              <div style="flex: 1; padding-left: 1rem;">
                <div style="line-height: 2; font-weight: bold;">
                  <span style="color: #0a7bc4;">{{child.uid.username}}</span>
                  &nbsp;回复
                  <span style="color: #0a7bc4;">@{{child.puid.username}}</span>
                </div>
                <div class="d-f a-i-c">
                  <span>{{child.created | cTime}}</span>
                  <span class="btnOn1" @click="btn1(child.uid,child._id,child.uid.username,idx,cmt._id)">回复</span>
                </div>
                <div class="v-note-wrapper markdown-body" v-html="child.content" style="padding: 5px 0 10px;"></div>
              </div>
            </li>
          </ul>

        </div>
      </div>

    </div>

  </div>
</template>

<script>
/*<!--<mavon-editor ref="md1"
  language="zh-CN"
  :subfield="false"
  defaultOpen="preview"
  :editable="false"
  :shortCut="false"
  previewBackground="#c4c3a2"
  codeStyle="gruvbox-dark"
  :toolbarsFlag="false"
  :navigation="false"/>-->*/
// subfield为是否双栏,defaultOpen是默认显示区域preview是预览edit是编辑,editable为是否允许编辑
// shortCut为是否使用快捷键,codeStyle是代码块颜色,toolbarsFlag为是否显示工具栏,navigation为是否打开导航目录
// language是语言,scrollStyle为是否开启滚动条样式(暂时仅支持chrome),toolbarsBackground是工具栏背景色
// previewBackground是预览区背景色,autofocus为是否自动聚焦到文本框
export default {
  name: 'Doc',
  data () {
    return {
      doc:{}
      ,prev:{}
      ,next:{}
      ,cmtArr:[]
      ,placeholder:'开始编辑...'
      ,puid:null
      ,pcmtid:null
      ,uName:null
      ,cmtId:null
      ,cmtFrom:0
      ,mdOption:{
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 中划线
        mark: false, // 标记
        superscript: true, // 上角标
        subscript: true, // 下角标
        quote: true, // 引用
        ol: true, // 有序列表
        ul: true, // 无序列表
        link: true, // 链接
        imagelink: false, // 图片上传
        code: true, // 代码块
        table: true, // 表格
        fullscreen: true, // 全屏编辑
        readmodel: true, // 沉浸式阅读
        htmlcode: false, // 展示html源码
        help: true, // 帮助
        /* 1.3.5 */
        undo: true, // 上一步
        redo: true, // 下一步
        trash: true, // 清空
        save: false, // 保存（触发events中的save事件）
        /* 1.4.2 */
        navigation: false, // 导航目录
        /* 2.1.8 */
        alignleft: true, // 左对齐
        aligncenter: true, // 居中
        alignright: true, // 右对齐
        /* 2.2.1 */
        subfield: true, // 单双栏模式
        preview: true, // 预览
      }
    }
  },
  methods:{
    getDocNav(){
      let docContent = this.$refs.docContent;
      let docNav = this.$refs.docNav;
      docNav.innerHTML='<div>目录</div>';
      // 点击目录锚点跳转
      let domArr = this.$refs.md1.querySelectorAll('h1,h2,h3,h4,h5,h6');
      let domArr1 = [];
      for (let i=0; i < domArr.length; i++) {
        let ment = domArr[i].cloneNode(true);
        // ment.removeAttribute('id');// 删除id属性
        ment.id = 'ment'+ment.id;
        domArr1.push(ment);
        docNav.appendChild(ment);
        ment.addEventListener('click',() => {
          docContent.scrollTop = domArr[i].offsetTop + 60// - domArr[0].offsetTop;
        },true);
      }
      // 滚动监听锚点
      this.$refs.docContent.addEventListener('scroll',(e) => {
        if (this.$route.matched[0].name !== 'Doc') {return}
        // 文章区滚动高度要减去简介区的高度,加180是居中
        let eScrollTop = e.target.scrollTop - this.docH1 + 180;
        let now = 0;
        for (let j=0; j < domArr.length; j++) {
          // 最后一个元素高度必须大于等于滚动区域的高度,不然最后一个元素就滚动不上去
          // 判断滚动条滚动距离是否大于当前滚动项可滚动距离
          let judge = eScrollTop >= domArr[j].offsetTop + 60// - domArr[0].offsetTop;
          if (judge) {now = j;}
        }
        for (let k=0; k < domArr1.length; k++) {
          domArr1[k].className = k === now ? 'active' : '';
        }
        // 文章区的滚动高度除以文章区高度得出滚动的百分比,再乘目录区的高度
        let scroll2 = (eScrollTop/this.docH).toFixed(2)*1*this.$refs.docNav.offsetHeight;
        docNav.scrollTop = scroll2;
      });
      // 手机点击目录(加上节流判断防止点击过快)
      let oldTime = new Date();
      this.$refs.side2.addEventListener('click',(e) => {
        if (window.screen.width < 767) {
          if(new Date() - oldTime < 1000){return;}
          oldTime = new Date();
          if (e.target.children[0] === docNav) {
            this.onSide();
          } else {
            setTimeout(() => {
              this.onSide();
            },1000);
          }
        }
      },true);
    },
    // 手机点击目录后关闭目录
    onSide(){
      this.$refs.side2.classList.toggle('side2');
    },
    prevOn(docId){
      if (this.prev._id) {this.getDoc(docId);}
    },
    nextOn(docId){
      if (this.next._id) {this.getDoc(docId);}
    },
    commentBtn(){
      if (!localStorage.zhanlanblogUser) {return this.$store.commit('updateMsg','请先登录');}
      if (this.$refs.md2.d_value === '') {return this.$store.commit('updateMsg','请输入评论内容');}
      let obj = {},obj1 = {};
      obj1.uid = JSON.parse(localStorage.zhanlanblogUser).uid;
      obj1.uName = JSON.parse(localStorage.zhanlanblogUser).name;
      obj1.content = this.$refs.md2.d_render;
      if (!this.puid || !this.pcmtid) {
        obj1.did = this.doc._id;
        obj = {data:obj1};
      } else {
        obj.puid = this.puid;obj.pcmtid = this.pcmtid;obj.cmtId = this.cmtId;obj.data = obj1;
      }
      this.$axios.post(process.env.API_HOST+'upCmt',obj)
      .then(res => {
        this.$ifLogin(res,this,() => {
          this.$store.commit('updateMsg',res.msg);
          if (!this.puid || !this.pcmtid) {
            this.cmtArr.unshift(res.data);
          } else {
            let _id = res.data.puid;
            res.data.puid = {_id:_id,username:this.uName};
            this.cmtArr[this.cmtFrom].child.push(res.data);
          }
          this.resetBtn();
        });
      })
      .catch(() => {this.$store.commit('updateMsg','网络异常，请稍后重试');});
    },
    btn1(puid = null,pcmtid = null,uName = null,idx,cmtId = null){
      this.resetBtn();
      this.placeholder = `@${uName}`;
      this.puid = puid;
      this.pcmtid = pcmtid;
      this.uName = uName;
      this.cmtFrom = idx;
      this.cmtId = cmtId;
      document.documentElement.scrollTop = this.$refs.cmtTop.offsetTop - 100;
    },
    resetBtn(){
      this.placeholder = '开始编辑...';
      this.$refs.md2.d_value = '';
      this.puid = null;
      this.pcmtid = null;
      this.uName = null;
      this.cmtFrom = 0;
      this.cmtId = null;
    },
    getDoc(dId){
      let docId;
      dId ? docId = dId : docId = this.$route.query.docId;
      this.$axios.post(process.env.API_HOST+'docLoad',{docId})
        .then(res => {
          this.$ifLogin(res,this,() => {
            // this.$refs.md1.d_value = res.data.markdown;
            // this.$refs.md1.d_render = res.data.mdHtml;
            // this.maxPage = res.maxPage;
            this.doc = res.data;
            this.prev = res.prev;
            this.next = res.next;
            this.$nextTick(() => {
              this.getDocNav();
              this.getCmt();
            });
          },() => {this.$router.push('/')});
        })
        .catch(() => {
          this.$store.commit('updateMsg','网络异常，请稍后重试');
          this.$router.push('/');
        });
    },
    getCmt(){
      let did = this.doc._id;
      this.$axios.post(process.env.API_HOST+'docCmt',{did})
      .then(res => {
        this.$ifLogin(res,this,() => {
          this.cmtArr = res.data;
          this.$nextTick(() => {
            this.scrollCmt();
          });
        });
      })
      .catch(() => {this.$store.commit('updateMsg','网络异常，请稍后重试');});
    },
    scrollCmt(){
      if (!this.$route.query.cmtId) {return}
      let cmtDom = document.getElementById(`${this.$route.query.cmtId}`);
      if (!cmtDom) {return}
      document.documentElement.scrollTop = cmtDom.offsetTop - 100;
    }
  },
  created(){
    // 把mavon-editor域名引入的文件改为本地引入的(暂不使用)
    /*let head = document.head || document.getElementsByTagName('head')[0];
    let srcArr = ['/static/mavon/katex.min.js','/static/mavon/highlight.min.js'];
    let srcArr1 = ['/static/mavon/github-markdown.min.css','/static/mavon/katex.min.css','/static/mavon/gruvbox-dark.min.css'];
    for (let i=0; i < srcArr.length; i++) {
      let script = document.createElement('script');
      script.type = 'text/javascript';script.charset = 'UTF-8';script.src = srcArr[i];
      head.appendChild(script);
    }
    for (let i=0; i < srcArr1.length; i++) {
      let link = document.createElement('link');
      link.rel = 'stylesheet';link.href = srcArr1[i];
      head.appendChild(link);
    }*/
  },
  mounted(){
    window.scrollTo(0,0);
    this.getDoc();
  },
  computed:{
    docH(){
      let total = this.$refs.docContent.children[0].offsetHeight
        + this.$refs.docContent.children[1].offsetHeight
        - this.$refs.docContent.clientHeight;
      return total
    },
    docH1(){
      return this.$refs.docContent.children[0].scrollHeight
    }
  },
  filters:{
    cTime: val => {
      if (val) {
        let t1 = new Date(val);
        return t1.getFullYear() + "-" + (t1.getMonth()+1) + "-" + t1.getDate();
      }
    },
    cTitle: val => {
      if (val) {
        if (val.length > 20) {
          return val.slice(0,20);
        } else {
          return val;
        }
      }
    }
  },
  watch:{
    $route(to,from){
      if (this.$route.query.cmtId) {this.scrollCmt();}
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.content{
  padding: 0; background-color: #c4c3a2;
  overflow: hidden; overflow-y: scroll; scroll-behavior:smooth;
  .docDesc{
    position: relative; padding: 2.143rem 2.143rem;/*30*/
    background-color: #49b1f5; background-attachment: local;
    background-position: center; background-size: cover; color: #fff;
    > div{
      position: relative; line-height: 2;
      > h1{font-size: 30px;}
    }
  }
  .markdown-body.v-note-wrapper{/*padding: 0.357rem;*//*5*/}
  .showMD{
    padding: 0.929rem 2.143rem 1.429rem 2.143rem;/*13 30 20 30*/ border: none!important;
    border-radius: 0!important; box-shadow: none!important; background-color: #c4c3a2;
  }
}
.docDesc:before{
  position: absolute; top: 0; left: 0; display: block; content: '';
  width: 100%; height: 100%; opacity: 0.5;
  background-image: linear-gradient(234deg, #394245 0%, #000 100%);
}
.side{
  .docNav{
    padding-top: 0.571rem; /*8*/ line-height: 2;
    overflow: hidden; overflow-y: scroll; scroll-behavior:smooth;
  }
}
.onside{display: none; z-index: 4; padding: 0.214rem;/*3*/ background-color: #3e4146; color: #fff;}

@media screen and (max-width: 767px){
  .side{display: none;}
  .onside{position: fixed; display: block; bottom: 30%; left: 0; line-height: 1.3; font-size: 16px;}
  .side2{
    position: fixed; display: flex; z-index: 4; top: 0; left: 0;
    justify-content: center; align-items: center; margin-top: 5.04rem;/*70.56*/
    width: 100vw; height: calc(100vh - 5.04rem); background-color: rgba($color: #000, $alpha: 0.7);
    .docNav{width: 80%; height: 90%!important; background-color: #fff;}
  }
}

.turnBtn{
  width: 75%; padding-top: 3.571rem;/*50*/ align-items: flex-start;
  > span{display: block; padding: 0.714rem;/*10*/ border: 1px solid #b9b9b9;
    border-radius: 0.571rem; font-size: 16px; cursor: pointer; background-color: #fff;}
  > span:nth-child(2){margin-top: 1.071rem;/*15*/}
}

.comment{
  width: 75%; padding-top: 3.571rem;/*50*/
  .tit{padding-bottom: 2.143rem;/*30*/ font-size: 20px; font-weight: bold;}
  .md2{min-height: 150px; height: 150px; box-shadow: 0 0 1.5px 1.5px rgba(7,17,27,0.15)!important;}
  > div:nth-child(3){padding-top: 1.429rem; padding-bottom: 2.143rem;}
  .btnOn{padding: 0.714rem 1.429rem;/*10 20*/ border-radius: 5px; background-color: #555; color: #fff;}
  .btnOn1{
    margin-left: auto; padding: 0.5rem 1rem;/*7 14*/
    border: 1px solid #555; border-radius: 5px; color: #555; cursor: pointer;
  }
  > div.cmt{padding-bottom: 2.143rem;/*30*/}
  > div.cmt:last-child{padding-bottom: 0.357rem;/*5*/}
  .cmt{
    img{
      object-fit: cover; margin-right: 1rem; max-width: 3.185rem; max-height: 3.185rem;/*44.59*/
      box-shadow: 0 0 1.5px 1.5px rgba(7,17,27,0.25);
    }
    > div{
      padding: 7px 1rem;
      box-shadow: 0 0 1.5px 1.5px rgba(7,17,27,0.15);
      border-radius: 0.714rem;/*10*/ background-color: #fff;
    }
    ul{
      list-style: none; padding: 0.714rem 0 0.929rem;/*10 13*/
      li{margin-bottom: 1.429rem;/*20*/}
      li:last-child{margin-bottom: 0;}
    }
  }
  .cmt .markdown-body{border: none; font-size: 14px; background-color: unset;}
  .cmt .v-note-wrapper{min-width: auto; min-height: auto;}
}

@media screen and (max-width: 767px){
  .turnBtn{width: 100%;}
  .comment{width: 100%;}
}
</style>
