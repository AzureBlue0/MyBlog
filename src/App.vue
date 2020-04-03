<template>
  <div id="app">
    <div class="msg" ref="msg">{{newMsg}}</div>
    <canvas ref="bgCanvas" class="bgCanvas"></canvas>
    <keep-alive include="Header">
      <Header></Header>
    </keep-alive>
    <div class="body" ref="body">
      <transition mode="out-in">
        <router-view></router-view>
      </transition>
    </div>
    <footer class="foot">
      <h4>欢迎访问 zhanlan.ink </h4>
      <h4><a href="http://www.beian.miit.gov.cn">粤ICP备19149088号</a></h4>
    </footer>
  </div>
</template>

<script>
import Header from '@/components/Header'
import * as THREE from 'three';
import {FlyControls} from "three/examples/jsm/controls/FlyControls";
export default {
  name: 'App',
  data () {
    return {
      width:0
      ,height:0
    }
  },
  methods:{
    loginOn(){
      this.$axios.post(process.env.API_HOST+'loginOn', {})
      .then(res => {
        this.$ifLogin(res,this);
      })
      .catch(() => {
        let res = {error:1,msg:'网络异常，请稍后重试'};
        this.$ifLogin(res,this,() => {},() => {return this.$router.push('/');});
      });
    },
    getRenderer(){
      let canvas = this.$refs.bgCanvas;
      canvas.width = this.width;
      canvas.height = this.height;
      const render = new THREE.WebGLRenderer({canvas});
      // 调整颜色输出(伽马输出)
      // render.outputEncoding = 3001;// 3001是变亮,镜面的反射变清晰
      render.setClearColor(0xffffff);// 设置世界的背景色
      render.setPixelRatio(window.devicePixelRatio);// 同步分辨率
      render.setSize(this.width,this.height);
      // render.shadowMap.enabled = true;// 打开阴影
      return render
    },
    getCamera(){
      // const camera = new THREE.PerspectiveCamera(75,this.width/this.height,1,1000);
      const camera = new THREE.PerspectiveCamera(20,this.width/this.height,1,1000);
      camera.position.set(0,0,0);
      camera.lookAt(0,0,0);
      return camera
    },
    getScene(){
      const scene = new THREE.Scene();
      // scene.background = new THREE.Color(0xffffff);
      return scene
    },
    getCube(){
      let mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(0xffffff*Math.random())
        })
      )
      return mesh
    },
    bgCanvasInit(){
      this.controls = new FlyControls(this.camera,this.renderer.domElement);
      // this.controls.movementSpeed = 20;// 设置移动的速度
      this.controls.rollSpeed = 0.5;// 设置旋转速度
      // this.controls.autoForward = true;// 自动前进
      this.controls.dragToLook = true;// 是否拖拽旋转
      this.cubeList = [];
      for(let i =0; i < 300; i++){
        let cube = this.getCube();
        cube.position.set(
          (Math.random()-.5) * 50,
          (Math.random()-.5) * 50,
          (Math.random()-.5) * 50,
        );
        cube.rotation.set(
          Math.random() * Math.PI/2,
          Math.random() * Math.PI/2,
          Math.random() * Math.PI/2,
        );
        this.cubeList.push(cube)
      }
      this.camera.position.set(0, 0, 0);
      this.scene.add(...this.cubeList);
      this.addCameraCenterRaycaster();
      this.animation();
    },
    addCameraCenterRaycaster(){
      // let win = document.getElementById('app');
      this.raycaster = new THREE.Raycaster();
      // 不要在初始化的时候设置, 需要在更新的时候设置
      // this.camera
      this.mouse = {
        x : 0,
        y : 0
      };
      // if (e.target.id !== 'app') {return}
      let objId = '';
      window.addEventListener("mousemove", e => {
        this.mouse.x = e.clientX / window.innerWidth * 2 -1;
        this.mouse.y = - e.clientY / window.innerHeight * 2 + 1;
        this.raycaster.setFromCamera(
          this.mouse,
          this.camera
        );
        let arr = this.raycaster.intersectObjects(this.scene.children);
        if(arr.length > 0){
          if (objId === '' || objId !== arr[0].object.uuid) {
            objId = arr[0].object.uuid;
            return arr[0].object.material.color = new THREE.Color(0xffffff*Math.random())
          }
        } else {
          objId = ''
        }
      },true)
    },
    animation(){
      this.controls.rotationVector.x = 0.1;
      // this.controls.rotationVector.y = 0.1;
      this.controls.rotationVector.z = 0.1;
      requestAnimationFrame(this.animation);
      this.controls.update(this.clock.getDelta());
      this.renderer.render(this.scene,this.camera);
    },
    resize(){
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    }
  },
  created(){
    document.addEventListener('click', function(e) {
      if(e.target && e.target.className === 'btnOn') {
        e.target.classList.toggle('btnAnim');
        setTimeout(() => {e.target.classList.toggle('btnAnim');},300);
      }
    },true);
  },
  mounted(){
    this.$nextTick(()=>{
      this.$store.commit('saveMsgRef',this.$refs.msg)
    });

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.clock = new THREE.Clock();
    this.renderer = this.getRenderer();
    this.camera = this.getCamera();
    this.scene = this.getScene();
    // 其他操作全放在获取场景,相机,渲染器后面
    window.addEventListener('resize',this.resize);
    this.bgCanvasInit();
  },
  components:{
    Header
  },
  computed:{
    newMsg(){
      return this.$store.state.msg
    }
  },
  watch:{
    '$route' (to, from) {
      if (this.$route.matched[0].name === 'usercenter') {
        if (!localStorage.zhanlanblogUser) {return this.$router.push('/');}
        this.loginOn();
      }
      if (this.$route.matched[0].name === 'Doc') {
        this.$refs.body.style.cssText = 'padding: 0 3%; max-width: 1529px;';
      }
      if (this.$route.matched[0].name !== 'Doc') {
        this.$refs.body.style.cssText = 'max-width: 85.714rem;';
      }
      if (this.$route.matched[0].name !== 'ChatRoom') {
        // console.log(this.$store.state.socket);
        this.$store.commit('reSocket');
      }
      /*if (to.path == '/') { // 监听路由改变组件切换特效的transition组件name名(已废弃)
        this.transitionName = 'slide-right';
      }else{
        this.transitionName = 'slide-left';
      }*/
    }
  }
}
</script>

<style lang='scss'>
html{font-size: 14px;}
body{color: #4c4948; font-family: Lato, Helvetica Neue For Number, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, PingFang SC, Hiragino Sans GB,"Microsoft JhengHei", "MicrMicrosoft YaHei", Helvetica Neue, Helvetica, Arial, sans-serif;}
/*html, body{scroll-behavior:smooth;}*/
.wrap{max-width: 85.714286rem;/*1200px*/ width: 100%; margin: 0 auto;}
@media screen and (max-width: 1024px){
  .wrap{width: 100%; padding: 0 .9375rem;/*13.125px*/}
}
.bsb{box-sizing: border-box;}
.l-h-1{line-height: 1;}
.d-f{display: flex;}
.f-d-c{flex-direction: column;}
.j-c-c{justify-content: center;}
.a-i-c{align-items: center;}
.t-o-e{white-space: nowrap; text-overflow: ellipsis; overflow: hidden;}
@media screen and (max-width: 768px){
  .xm-f-d-c{flex-direction: column;}
}
@media screen and (max-width: 767px){
  .xs-f-d-c{flex-direction: column;}
}

.body{max-width: 85.714rem;/*1200*/ min-height: 80vh; margin: 0 auto;}
.body > div{
  padding: 2.857rem 0;/*40*/
  /*transition: all .5s cubic-bezier(.55,0,.1,1);*/
}
@media screen and (max-width:1024px){
  .body{padding: 0 3%;}
}
@media screen and (max-width:768px){
  .body{min-height: 90vh;}
}
@media screen and (max-width:767px){
  .body{min-height: 80vh;}
}
.foot{
  padding: 1.5rem 0;/*21*/ text-align: center; line-height: 1.7;
  font-size: 12px; background-color: #2d3035; color: #ccc;
  a{color: #ccc}
}

.b-shadow{
  box-sizing: border-box;
  padding: 1.429rem;
  border-radius: 0.571rem;/*8*/
  transition: all 0.3s;
  box-shadow: 0 0 1.5px 1.5px rgba(7,17,27,0.15);
}
.b-shadow:hover{box-shadow: 0 0 12px 12px rgba(7,17,27,0.15);}

.side{
  width: 23%;
  > div{background-color: #fff;}
}
.content{
  width: 75%; margin-right: 2%;
  > div{background-color: #fff;}
}
@media screen and (max-width: 768px){
  .side{margin-top: 2.143rem;/*30*/ width: 100%;}
  .content{width: 100%; margin-right: 0;}
}

.btnOn{cursor: pointer;}
.btnAnim{animation: btnAnim .3s 1;}
@keyframes btnAnim{
  0%{transform:scale(0.9);}
  100%{transform:scale(1);}
}

.labelObj span{
  display: inline-block; margin-right: 1.429rem; padding: 0.357rem 0.714rem;
  border-radius: 20px; border: 1px solid rgba(7,17,27,0.3);
  font-weight: bold; font-size: 15px; cursor: pointer;
}

/*重置markdown编辑器的图层*/
.markdown-body.v-note-wrapper{z-index: 4;}
/*重置markdown编辑器的列表样式*/
.markdown-body ol{list-style: decimal;}
.markdown-body ul{list-style: disc;}
/*重置markdown行内样式*/
/*.markdown-body h2{margin-top: 0!important; margin-bottom: 0!important;}*/
/*.markdown-body p{margin-bottom: 0.929rem!important;}*/
.markdown-body blockquote{padding-top: 0.714rem!important; padding-bottom: 0.714rem!important;/*10*/ background-color: #cacaca;}
.markdown-body .highlight pre, .markdown-body pre{font-size: 100%!important; background-color: #ccc!important;}

/*组件切换动画*/
.v-enter,.v-leave-to{
  opacity: 0;
  transform: translateX(150px);
}
.v-enter-active,.v-leave-active {
  transition: all 0.35s ease;
}

.msg{
  display: none;
  position: fixed;
  z-index: 7;
  justify-content: center;
  align-items: center;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  width: 15.714286rem;/*220*/
  min-height: 3.214286rem;/*46*/
  padding: 1.142857rem;/*16*/
  line-height: 2;
  font-family: '微软雅黑';
  font-weight: bold;
  font-size: 15px;
  background-color: rgba($color: #000, $alpha: 0.78);
  color: #fff;
}
.msg-on{display: flex; animation: msgAnima .5s 1;}
@keyframes msgAnima{
  0%{opacity: 0;}
  100%{opacity: 1;}
}

.bgCanvas{
  position: fixed; pointer-events: none; display: block; outline: none;
  top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1;
}
</style>
