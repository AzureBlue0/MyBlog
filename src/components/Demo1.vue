<template>
  <div>
    <div style="padding: 0 0 20px;">
      鼠标左键点击下方窗口开始，esc退出，wasd移动，鼠标左键射击，r键重置
    </div>
    <div ref="box" style="height: 80vh; box-shadow: 0 0 12px 12px rgba(7,17,27,0.15);">
      <canvas ref='canvas' style="display: block; outline: none;"></canvas>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {PointerLockControls} from "three/examples/jsm/controls/PointerLockControls";

export default {
  name: 'Demo',
  data () {
    return {
      width:0
      ,height:0
      ,objList:[]
      ,moveState:{
        w: false,
        s: false,
        a: false,
        d: false,
        " ": false, // 空格状态
      }
      ,fallState:false
      ,canJump:false// 允许跳跃
      ,cameraState:{
        y: 100,
        vy: 0, // y轴上的速度
        g: -0.08 // y上向下自由落体的加速度
      }
      ,ballList:[]
    }
  },
  components:{},
  methods:{
    getRenderer(){
      let canvas = this.$refs.canvas;
      canvas.width = this.width;
      canvas.height = this.height;
      const render = new THREE.WebGLRenderer({canvas});
      // 调整颜色输出(伽马输出)
      // render.outputEncoding = 3001;// 3001是变亮,镜面的反射变清晰
      render.setClearColor(0xbfd1e5);// 设置世界的背景色
      render.setPixelRatio(window.devicePixelRatio);// 同步分辨率
      render.setSize(this.width,this.height);
      render.shadowMap.enabled = true;// 打开阴影
      return render
    },
    getCamera(){
      // const camera = new THREE.PerspectiveCamera(75,this.width/this.height,1,1000);
      const camera = new THREE.PerspectiveCamera(20,this.width/this.height,1,1000);
      camera.position.set(100,100,100);
      camera.lookAt(0,0,0);
      return camera
    },
    getScene(){
      const scene = new THREE.Scene();
      // scene.background = new THREE.Color(0xbfd1e5);
      return scene
    },
    // 获取场景背景
    bgTexture () {
      /*const loader = new THREE.CubeTextureLoader();
      // 顺序是左,右,上,下,后,前(正面)
      const bgTexture = loader.setPath('static/demo/three/img/').load([
        'posx.jpg','negx.jpg',
        'posy.jpg','negy.jpg',
        'posz.jpg','negz.jpg',
      ]);
      this.scene.background = bgTexture;*/
      // this.scene.background = new THREE.Color(0xbfd1e5);
    },
    addLight(){
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      let light = new THREE.DirectionalLight(0xffffff, 0.8);
      light.position.set(-1000, 1000, 500);
      light.castShadow = true;
      let d = 100;
      light.shadow.camera.left = -d;
      light.shadow.camera.right = d;
      light.shadow.camera.top = d;
      light.shadow.camera.bottom = -d;

      light.shadow.camera.near = 2;
      light.shadow.camera.far = 2;

      light.shadow.mapSize.x = 1024;
      light.shadow.mapSize.y = 1024;

      this.scene.add(light);
    },
    // 添加控制模式
    addControlMode(){
      this.controls = new PointerLockControls(this.camera,this.renderer.domElement);
      this.renderer.domElement.addEventListener('click', () => {
        this.controls.lock()
      });
      this.controls.addEventListener( 'lock', () => {
        if (!this.controls.isLocked) {
          // console.log("游戏开始")
          if (!this.animate) {
            this.animation()
          }
          this.fallState = true;
          this.reLookAt();
          this.fireEvent();
        }
      });
      this.controls.addEventListener( 'unlock',  () => {
        // console.log("游戏暂停")
        this.fallState = false
        cancelAnimationFrame(this.animate)
        this.animate = null
      });
      // wsad按键状态转换
      window.addEventListener("keydown", e => {
        let key= e.key.toLocaleLowerCase();
        if(this.moveState[key]===false){
          this.moveState[key] = true
        }
      })
      window.addEventListener("keyup", e => {
        let key= e.key.toLocaleLowerCase();
        if(this.moveState[key]===true){
          this.moveState[key] = false
        }
        if (key === 'r') { this.reLookAt(); }
      })
      this.controls.update = () => {
        const speed = 0.6
        if(this.moveState.w){
          this.camera.translateZ(-speed)
        }
        if(this.moveState.s){
          this.camera.translateZ(speed)
        }
        if(this.moveState.a){
          this.camera.translateX(-speed)
        }
        if(this.moveState.d){
          this.camera.translateX(speed)
        }
        if(this.moveState[" "]){
          if(this.canJump){
            this.canJump = true
            this.cameraState.vy = 1
            this.fallState = true
          }
        }
        // 判断落下
        if(this.fallState){
          this.canJump = false
          this.cameraState.vy += this.cameraState.g
          this.cameraState.y += this.cameraState.vy
          this.camera.position.y = this.cameraState.y
        }else{
          this.canJump = true
          this.cameraState.vy = 0
        }
        // 判断与地板的接触
        const raycaster = new THREE.Raycaster(
          this.camera.position,
          new THREE.Vector3(0, -1, 0)
        )
        let arr1 = [this.floor]
        let arr = raycaster.intersectObjects(arr1)
        if(arr[0] && arr[0].distance < 5){
          this.canJump = true
          this.fallState = false
          this.camera.position.y = arr[0].object.position.y + 5
          this.cameraState.vy = 0
        }
      }
    },
    reLookAt(){
      this.objList.forEach(obj => {
        obj.lookAt(
          this.camera.position.x,
          0,
          this.camera.position.z
        )
      });
    },
    fireEvent(){
      // 把点击鼠标左键射击的事件搬到这里,防止开始游戏的瞬间触发这个事件
      this.renderer.domElement.addEventListener('mousedown',e => {
        const key = e.button;
        if(key === 0){
          this.cameraInfo = this.fireMode.getDirection();// 相机的位置
          this.fireMode.fireBall(this.cameraInfo)
        }
      });
    },
    // 点击鼠标左键的开枪动作
    fireMode(){
      this.fireMode.getDirection = () => {
        const position = this.camera.position;
        // 发射过程中的各种效果, 通过raycaster访问相机朝向
        const raycaster = new THREE.Raycaster();
        const coords = {x: 0, y: 0};
        raycaster.setFromCamera(coords, this.camera);
        const direction = raycaster.ray.direction;// 相机的朝向
        return {direction, position}
      };

      this.fireMode.fireBall = ({position, direction}) => {
        this.ballList.push(this.fireMode.createBall(position, direction));// 多个子弹的发射过程
        /// 循环 this.ballList 将小球每个以各自的速度和方向进行更新
      };

      this.fireMode.createBall = (position, direction) => {
        const geometry = new THREE.SphereGeometry(.3, 10, 10)
        const material = new THREE.MeshLambertMaterial({
          color: new THREE.Color('#d69b16')
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.name = 'ball';
        position = Object.assign({}, position)
        mesh.position.set(position.x ,position.y, position.z)
        this.scene.add(mesh)
        let that = this
        return {
          mesh,
          position,
          direction,
          dv: 4,// 子弹速度
          update: function () {
            // 维护position 下一轮的position
            position.x += direction.x * this.dv
            position.y += direction.y * this.dv
            position.z += direction.z * this.dv
            this.mesh.position.set(position.x ,position.y, position.z)// 更新
          },
          kill: function () {
            that.scene.remove(this.mesh)
          }
        }
      };

      this.fireMode.update = () => {
        this.ballList.forEach(ball => {
          ball.update()
        })
      };
    },
    // 创建地板
    createFloor(){
      let textureLoader = new THREE.TextureLoader();
      this.floor = new THREE.Mesh(new THREE.BoxGeometry(400,2,400,1,1,1),new THREE.MeshPhongMaterial({color: 0xffffff}));
      this.floor.name = 'floor';
      this.floor.castShadow = true;       // 开启投影
      this.floor.receiveShadow = true;    // 接受阴影(可以在表面上显示阴影)
      this.floor.position.set(100, -1 ,100);
      textureLoader.load("static/demo/three/img/grass.png",(texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(200, 200);
        this.floor.material.map = texture;
        this.floor.material.needsUpdate = texture;
        this.scene.add(this.floor);
      });
    },
    // 载入模型
    loaderObj(){
      const gltfLoader = new GLTFLoader();

      gltfLoader.load("static/demo/three/miao.gltf", res => {
        // console.log(res) // res.scene是加载头盔的场景
        res.scene.name = 'obj';
        res.scene.scale.set(2, 2, 2);
        res.scene.position.set(0, 0 ,1);
        res.scene.traverse( mesh => {
          // 背景对所有面进行一一映射
          if(mesh.isMesh){
            mesh.material.side = THREE.DoubleSide;
            // mesh.material.envMap = this.scene.background;
          }
        });
        res.scene.castShadow = true;
        res.scene.receiveShadow = true;
        for (let i = 0; i < 16; i++) {
          let cl = res.scene.clone();
          cl.position.set(Math.random() * 200, 0, Math.random() * 200);
          if (i === 0) { cl.position.set(0, 0, 1) }
          this.scene.add(cl);
          this.objList.push(cl);
        }
      })
    },
    // 保持模型跟地板距离的
    objUpdate(){
      this.objList.forEach((obj, index) => {
        let raycaster2 = new THREE.Raycaster(
          obj.position,
          new THREE.Vector3(0, -1, 0)
        )
        let arr1 = [this.floor];
        let arr = raycaster2.intersectObjects(arr1)
        if(arr[0] && arr[0].distance < 5){
          obj.position.y = arr[0].object.position.y + 0.45
        }
      });
    },
    // 检测子弹与相机距离,和子弹与模型的距离
    checkDistance(obj1, obj2, distance){
      let y = obj2.position.y;
      if (obj2.name === 'obj') { y = y + 2.5 }
      let dx = (obj1.position.x - obj2.position.x)
      let dy = (obj1.position.y - y)
      let dz = (obj1.position.z - obj2.position.z)
      return dx*dx + dy*dy + dz*dz
    },
    animation(){
      this.animate = requestAnimationFrame(this.animation);
      this.controls.update();
      this.fireMode.update();
      this.objUpdate();

      // 对发射出来的子弹和 objList里面每一个人进行判断, 距离小于一定值的时候, 可以删除这个obj
      this.ballList.forEach((ball, index) => {
        // 抽象一个方法判断距离,ball有position,camera有position,obj有position
        this.objList.forEach((obj, index) => {
          if (Math.sqrt(this.checkDistance(ball, obj)) < 2.5) {
            obj.lookAt(this.camera.position.x, 180, this.camera.position.z)
          }
        });
        if (!(this.checkDistance(ball, this.camera) < 200*200)) {
          ball.kill()
          this.ballList.splice(index, 1)
          index--
        }
      });

      this.renderer.render(this.scene,this.camera);
    },
    resize(){
      this.width = this.$refs.box.offsetWidth;
      this.height = this.$refs.box.offsetHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    }
  },
  created(){
  },
  mounted(){
    this.width = this.$refs.box.offsetWidth;
    this.height = this.$refs.box.offsetHeight;
    // this.$nextTick(() => {})
    this.renderer = this.getRenderer();
    this.camera = this.getCamera();
    this.scene = this.getScene();
    // 其他操作全放在获取场景,相机,渲染器后面
    this.createFloor();
    this.addControlMode();
    this.fireMode();
    this.addLight();
    this.loaderObj();
    window.addEventListener('resize',this.resize,true);
    this.animation();
  },
  destroyed(){
    window.removeEventListener("resize",this.resize,true);
    cancelAnimationFrame(this.animate);
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
</style>
