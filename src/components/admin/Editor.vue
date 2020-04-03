<template>
  <div>
    <div class="md-title">文章标题 : <input type="text" v-model="docTitle"></div>
    <mavon-editor ref="md" language="zh-CN"
                  toolbarsBackground="#2f3032"
                  previewBackground="#c4c3a2"
                  codeStyle="gruvbox-dark"
                  @imgAdd="imgAdd"
                  @imgDel="imgDel"/>
    <div style="margin-top: 1.429rem; padding-bottom: 0.5rem;">
      （注意：简介图片最好上传680/440的，首页显示421/273 (宽/高)）
    </div>
    <div class="descImg d-f f-d-c" ref="descImg">
      <span>上传图片，支持jpg/png/gif</span>
      <input type="file" @change="descFile" ref="upDescImg">
    </div>
    <div class="labelObj">
      <span v-for="(val,index) in labelObj"
            @click.self.once="labelPush($event.target,index)"
            :key="index"
            :style="{color:val}">
        {{index}}
      </span>
    </div>
    <div class="labelObj" ref="labelInput" style="padding: 0;">文章标签 : &nbsp;</div>
    <div style="padding-top: 20px;">
      <input type="checkbox" v-model="upImg"> 不修改简介图片&nbsp;
      <input type="checkbox" v-model="upImg1"> 不修改任何图片
    </div>
    <div class="up-btn d-f">
      <div class="btnOn" @click="upMdImg">更新文章</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Editor',
    data () {
      return {
        docTitle:''
        ,imgObj:{}
        ,descImg:''
        ,labelObj:{}
        ,labelArr:[]
        ,upImg:false
        ,upImg1:false
        ,btnOn:true
      }
    },
    created(){
      this.$axios.get('/static/mock/label.json')
      .then(res => {
        this.labelObj = res;
      })
    },
    mounted(){
      this.$nextTick(()=>{
        if (this.$route.query.docId == undefined) {return false;}
        this.$axios.post(process.env.API_HOST+`ManageDoc/loadDoc`,{docId:this.$route.query.docId})
        .then(res => {
          this.$ifLogin(res,this,() => {
            res = res.data;
            this.docTitle = res.docTitle;
            this.$refs.md.d_render = res.mdHtml;
            this.$refs.md.d_value = res.markdown;
            let imgDom = document.createElement('img');
            imgDom.style.cssText = 'max-width:100%; margin-top:15px;';
            imgDom.src = res.descImg;
            imgDom.width = '300';
            this.$refs.descImg.appendChild(imgDom);
            for (let i = 0; i < res.docLabel.length; i++) {
              let span = document.createElement('span');
              span.innerText = res.docLabel[i];
              if (this.labelArr.indexOf(res.docLabel[i]) < 0) {
                this.$refs.labelInput.appendChild(span);
                this.labelArr.push(res.docLabel[i]);
              }
            }
          });
        })
        .catch(() => {this.$store.commit('updateMsg','网络异常，请稍后重试');})
      })
    },
    methods: {
      descFile(){
        if (this.$refs.upDescImg.files[0] == undefined) {return false;}
        let arr = ['image/jpeg','image/png','image/gif'];
        if (arr.indexOf(this.$refs.upDescImg.files[0].type) < 0) {return false;}
        let len = this.$refs.descImg.children.length;
        if (this.$refs.descImg.children[len - 1].nodeName === 'IMG') {
          this.$refs.descImg.removeChild(this.$refs.descImg.lastChild);
        }
        let imgDom = document.createElement('img');
        imgDom.style.cssText = 'max-width:100%; margin-top:15px;';
        let reader = new FileReader();
        reader.readAsDataURL(this.$refs.upDescImg.files[0]);
        reader.onload = () => {
          imgDom.src = reader.result;
          imgDom.width = '300';
          this.$refs.descImg.appendChild(imgDom);
        }
      },
      labelPush(eDom,label){
        if (this.labelArr.indexOf(label) < 0) {
          this.$refs.labelInput.appendChild(eDom.cloneNode(eDom));
          this.labelArr.push(label);
        }
      },
      upArticle(){
        // 文章简介用编译后的html字符过滤掉标签即可(过滤html和&nbsp;之类的实体符号/<[^>]+>|&[^>]+;/g)
        // console.log(this.$refs.md.d_render.replace(/<[^>]+>/g,"").substring(0,93));
        let mdHtml = this.$refs.md.d_render;// 获取编译后的html
        let markdown = this.$refs.md.d_value;// 获取markdown
        let desc = mdHtml.replace(/<[^>]+>/g,"").substring(0,93);
        let obj = {
          docTitle: this.docTitle
          ,desc: desc
          ,markdown: markdown
          ,mdHtml: mdHtml
          ,docLabel: this.labelArr
          ,docId:this.$route.query.docId
        };
        if (!this.upImg && !this.upImg1) {obj.descImg = this.descImg;}
        this.$axios.post(process.env.API_HOST+`upDoc`, obj)
        .then(res => {
          this.$ifLogin(res,this,() => {
            this.$store.commit('updateMsg',res.msg);
            this.btnOn = true;
          },() => {this.btnOn = true;});
        })
        .catch(() => {this.$store.commit('updateMsg','网络异常，请稍后重试');this.btnOn = true;})
      },
      upMdImg(){
        if (this.docTitle === '') {
          this.$store.commit('updateMsg','请填写文章标题');return false;
        }
        if (this.$refs.md.d_render.replace(/<[^>]+>/g,"").length < 2) {
          this.$store.commit('updateMsg','请填写文章内容');return false;
        }
        if (this.labelArr.length === 0) {
          this.$store.commit('updateMsg','请选择文章标签');return false;
        }
        // 判断不修改任何图片直接去上传文章事件
        if (this.upImg1) {return this.upArticle();}
        if (this.$refs.upDescImg.files[0] === undefined && !this.upImg) {
          this.$store.commit('updateMsg','请上传简介图片');return false;
        }
        if (this.btnOn) {
          this.btnOn = false;
          // 第一步.将图片上传到服务器
          let formData = new FormData();
          let size = 0;
          for (let imgNum in this.imgObj) {
            // console.log(this.imgObj[imgNum]);// size是大小(b),type是文件类型,name和_name都是文件名
            size += this.imgObj[imgNum].size;
            if (size > 6 * 1024 * 1024) {
              return this.$store.commit('updateMsg','图片总大小已超过6M');
            }
          }
          for (let imgNum in this.imgObj) {
            formData.append(imgNum, this.imgObj[imgNum]);
          }
          // 把文章标题和简介图片也一并上传
          let endocTitle = encodeURIComponent(this.docTitle);
          formData.append('docTitle',endocTitle);
          if (!this.upImg) {formData.append('descImg',this.$refs.upDescImg.files[0]);}
          this.$axios.post(process.env.API_HOST+`upMdImg`, formData)
          .then(res => {
            this.$ifLogin(res,this,() => {
              // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
              for (let num in res.url) {
                this.$refs.md.$img2Url(num, res.url[num]);
              }
              this.descImg = res.descImg;
              this.upArticle();// 再将正确的文本上传
            },() => {this.btnOn = true;});
          })
          .catch(() => {
            this.$store.commit('updateMsg','网络异常，请稍后重试');this.btnOn = true;
          });
        }
      },
      imgAdd(pos, $file){// 缓存图片信息
        this.imgObj[pos] = $file;
      },
      imgDel(pos){
        delete this.imgObj[pos];
      }
    },
    watch:{
      '$route' (to, from) {
        if (this.$route.query.docId == undefined) {
          this.docTitle = '';
          this.$refs.md.d_render = '';
          this.$refs.md.d_value = '';
          let len = this.$refs.descImg.children.length;
          if (this.$refs.descImg.children[len - 1].nodeName === 'IMG') {
            this.$refs.descImg.removeChild(this.$refs.descImg.lastChild);
          }
          this.$refs.labelInput.innerHTML = '文章标签 : &nbsp;';
          this.labelArr = [];
        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.md-title{padding-bottom: 1.429rem;}
.md-title input{margin-top: 0.714rem; width: 100%; border-bottom: 1px solid;}
.v-note-wrapper.markdown-body{height: 600px; box-shadow: 0 0 1.5px 1.5px rgba(7,17,27,0.15)!important;}
.descImg{position: relative;}
.descImg input{position: absolute; left: 0; top: 0; max-width: 180px; height: 100%; opacity: 0; cursor: pointer;}
.labelObj{padding: 1.429rem 0;}
.up-btn{padding: 1.429rem 0;}
</style>
