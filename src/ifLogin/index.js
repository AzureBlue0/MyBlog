
// error:1是各种错误,2是账号在别处登录,3是非管理员登录,4是登录过期
export default (res,that,fn1,fn2) => {
  if (res.error === 0) {
    if (fn1 && typeof fn1 === "function") {fn1();}
  }else{
    that.$store.commit('updateMsg',res.msg);
    if (res.error === 2 || res.error === 4) {logout1(that);}
    if (fn2 && typeof fn2 === "function") {fn2();}
  }
}
// 前端只有这里和UserCenter.vue有判断uid的
function logout1(that){
  if (localStorage.zhanlanblogUser) {
    if (JSON.parse(localStorage.zhanlanblogUser).uid !== '5d6e26993dbb222cf888fc27') {
      if (that.$route.matched[0].name == 'usercenter') {that.$router.push('/');}
    }
    localStorage.removeItem('zhanlanblogUser');
  }
  if (that.$store.state.loginOn === true) {
    that.$store.commit('updateLoginOn');
  }
  that.$store.commit('reLoginUser');
  that.$store.commit('upLogoSrc','/static/logo.jpg');
}
