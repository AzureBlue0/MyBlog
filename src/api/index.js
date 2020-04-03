import axios from 'axios'

//定义一个请求拦截器
axios.interceptors.request.use(config => {
  if (localStorage.zhanlanblogUser) {
    config.headers['authorization'] = JSON.parse(localStorage.zhanlanblogUser).token;
    config.headers['uid'] = JSON.parse(localStorage.zhanlanblogUser).uid;
  }
  return config;
}, err => {
  return Promise.reject(err);
})

//定义一个响应拦截器
axios.interceptors.response.use(response => {
  // Do something with response data
  // return response.data.data;
  return response.data;
});

//请求home组件的数据接口
export let getHome = () => {
  return axios.get('/static/mock/index.json')
}
