<template>
  <div class="d-f f-d-c a-i-c">
    <img :src="photoSrc" class="photo">
    <div class="upPhoto" @click="photoFile1" title="请上传jpg/png/gif">修改头像
      <input type="file" @change="photoFile" ref="upPhoto">
    </div>
    <div class="form d-f f-d-c">
      <div ref="tips2">请输入6到18位的英文/数字/英文符号</div>
      <input type="password" v-model="form.password" @blur="verify(form)" placeholder=" 密码">
      <div class="d-f submit">
        <button class="btnOn" @click="reset">重置</button>
        <button class="btnOn" @click="submitForm(form)">提交</button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Own',
    data () {
      return {
        photoSrc:''
        ,form:{
          password:''
        }
        ,oldTime:0
      }
    },
    methods:{
      photoFile1(){this.$refs.upPhoto.click();},
      photoFile(){
        if (this.$refs.upPhoto.files[0] === undefined) {return false;}
        let arr = ['image/jpeg','image/png','image/gif'];
        if (arr.indexOf(this.$refs.upPhoto.files[0].type) < 0) {return this.$store.commit('updateMsg','请上传jpg/png/gif');}
        let reader = new FileReader();
        reader.readAsDataURL(this.$refs.upPhoto.files[0]);
        reader.onload = () => {
          this.photoSrc = reader.result;
        }
        // this.$store.commit('upLogoSrc',res.photo);
        // if(!this.verify(val)){return false;}
      },
      verify(val){
        if(!/^[\da-z_,/!@#\$%\^&*()+\-=\[\]{}\.<>?]{6,18}$/i.test(val.password)){
          this.$refs.tips2.style.color = 'red';return false;
        }else{
          this.$refs.tips2.style.color = 'green';
        }
        return true;
      },
      reset(){
        this.form.password = '';
        this.$refs.upPhoto.value = '';
        this.photoSrc = this.$store.state.logoSrc;
      },
      submitForm(val){
        let num = 0;
        let formData = new FormData();
        if (this.$refs.upPhoto.files[0] !== undefined) {
          if (this.$refs.upPhoto.files[0].size > 1 * 1024 * 1024) {
            return this.$store.commit('updateMsg','图片大小已超过1M');
          }
          formData.append('touxiang',this.$refs.upPhoto.files[0]);
          num++;
        }
        if (val.password !== '') {
          if(!this.verify(val)){return false;}
          formData.append('password',val.password.trim());
          num++;
        }
        if (num === 0) {return this.$store.commit('updateMsg','没有修改任何信息');}
        // 节流判断
        if(new Date() - this.oldTime < 5000){return this.$store.commit('updateMsg','请勿频繁修改');}
        this.oldTime = new Date();
        this.$axios.post(process.env.API_HOST+`reUserInfo`,formData)
        .then(res => {
          this.$ifLogin(res,this,() => {
            this.$store.commit('updateMsg',res.msg);
            if (res.photoSrc) {
              this.$store.commit('upLogoSrc',res.photoSrc);
              let obj = JSON.parse(localStorage.zhanlanblogUser);
              obj.logoSrc = res.photoSrc;
              localStorage.setItem('zhanlanblogUser',JSON.stringify(obj));
            }
            this.reset();
          });
        })
        .catch(() => {
          this.$store.commit('updateMsg','网络异常，请稍后重试');
        })
      }
    },
    created(){},
    mounted(){
      this.photoSrc = this.$store.state.logoSrc;
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
<style lang="scss" scoped>
.photo{
  object-fit: cover; width: 7.143rem; height: 7.143rem;
  border-radius: 50%; box-shadow: 0 0 1.5px 1.5px rgba(7,17,27,0.25);
}
.upPhoto{
  margin-top: 10px; padding: 0.5rem 1rem; font-weight: bold;
  background-color: #0a7bc4; color: #fff; cursor: pointer; overflow: hidden;
  input{display: none;}
}
.form{
  width: 21.429rem;/*300*/ max-width: 100%;
  div{padding: 1.429rem 0 10px;/*20*/}
  input{height: 24px; border-width: 2px; border-style: inset; border-color: initial;}
  .submit{
    button{width: 42%; height: 2.571429rem;/*36*/ background-color: #0a7bc4; color: #fff; cursor: pointer;}
    button:nth-child(2){margin-left: auto;}
  }
}
</style>
