// 算法参考
// https://baike.baidu.com/item/%E4%B8%8D%E5%8F%AF%E8%BF%98%E5%8E%9F%E7%9A%84%E6%8B%BC%E5%9B%BE/1446453
const shuffle = arr => { // 打乱数组
  let len = arr.length;
  for(let i = 0; i < len - 1; i++){
    let idx = Math.floor(Math.random() * (len - i));
    let temp = arr[idx];
    arr[idx] = arr[len - i - 1];
    arr[len - i - 1] = temp;
  }
  return arr;
};

const isValid = arr => { // Valid有效,判断数列的逆序是否为偶数  偶数=>有解
  let count = 0, len = arr.length;
  for(let i = 0; i < len; i++) {
    for(let j = i + 1; j < len; j++) {
      if(arr[j] < arr[i]) {
        count++;
      }
    }
  }
  return count % 2 === 0;
};

let row = 4;
let bgObj;
let wrap = document.getElementById('wrap');
window.onload = () => {init()}

let btn = document.querySelectorAll('.btn');
let rank = document.getElementById('rank');
btn[0].onclick = () => {
  if (row >= 9) {return rank.innerText = `兄dei你飘了`;}
  row++;
  rank.innerText = `难度 ${row}*${row}`;
  init();
}
btn[1].onclick = () => {
  if (row <= 2) {return rank.innerText = `救救孩子吧`;}
  row--;
  rank.innerText = `难度 ${row}*${row}`;
  init();
}

let type = ['image/jpeg','image/png','image/gif'];
// 拖拽文件时要阻止浏览器打开文件必须在dragover和drop两个事件里都要阻止浏览器默认行为
document.addEventListener('dragover', function (e) {
  e.preventDefault();// 阻止浏览器默认打开文件的操作
  e.stopPropagation();
  // e.dataTransfer.dropEffect = 'copy';// 阻止默认操作后把拖拽文件时鼠标光标右边的文字从移动变回复制
},false);
document.addEventListener('drop', function (e) {
  e.preventDefault();// 阻止浏览器默认打开文件的操作
  e.stopPropagation();
  let file = e.dataTransfer.files[0];
  if (!file || type.indexOf(file.type) === -1) {return}
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    bgObj = reader.result;
    init();
  }
},false);

function init () {
  wrap.innerHTML = '';
  let msg = document.createElement('div');
  msg.id = 'msg'; msg.style.display = "none";
  wrap.appendChild(msg);
  // | 按位或操作符,在有一个位是1的情况下就返回1,而只有在两个位数都是0的情况下才返回0,
  // 一个整数与0按位或运算可以得到它本身,一个小数与0按位或者运算可以得到取整的效果
  // console.log(4.1|0);// 4,这里是取整
  // 拼图是4*4,如果窗口宽除4后大于150,取最小值,拼图一格最小宽150,除4后小于150就按除4后的值
  // 每个拼图格子是content-box,中间的边框是重叠的,盒子的宽高只要加上一边的边框,另一边不加才对得上下面的定位
  let cellW = Math.min((window.innerWidth/row - 2.5)|0, (600/row));// 2.5是小屏幕时给屏幕两边留出左右各5px的空位
  wrap.style.height = (row* cellW + 2) + 'px';// 最外层盒子的宽高,+2是最右边的边框
  wrap.style.width = (row* cellW + 2) + 'px';
  let detime = 0, time, bgSrc;
  // ~~是取整,对于正数,它向下取整;对于负数,向上取整;非数字取值为0
  // if (!bg) {bgSrc = './bg'+ ~~(Math.random() * 3) +'.jpg';}
  !bgObj ? bgSrc = './bg'+ ~~(Math.random() * 3) +'.jpg' : bgSrc = bgObj;
  // fill方法是用传入的参数填满数组,不传参数就是undefined
  // map方法返回一个新数组,值是原数组调用函数处理后的值,第一个参数是当前元素的值,第二个是索引,第三个是当前元素属于的数组对象。
  // 数字对象的toString方法的参数radix,规定表示数字的基数,使 2 ~ 36 之间的整数,若省略该参数,
  // 则使用基数 10,但是要注意,如果该参数是 10 以外的其他值,则 ECMAScript 标准允许实现返回任意值。
  // 数字的字符串表示,例如,当 radix 为 2 时,NumberObject 会被转换为二进制值表示的字符串。
  // slice(-2)从倒数第二位开始截取
  // 拼图是4*4的,数组长度就是4*4,toString的radix(进制)就是4,想要5格的拼图就
  let pstArr = (new Array(row*row).fill()).map((v, i) => ('0' + i.toString(row)).slice(-2));
  // let pstArr1 = (new Array(25).fill()).map((v, i) => ('0' + i.toString(5)).slice(-2));// console.log(pstArr1);
  // console.log((15).toString(4),pstArr,(new Array(16).fill(1)));
  let lastNum = pstArr.length - 1;
  // let last = window.cell33;// 最后一格不占位的格子
  let last;// 最后一格不占位的格子
  let cellInit = val => {// 初始化拼图位置和宽高
    // let thisCell = window['cell' + i];// 获取<div id='cell00'></div>这个元素
    let thisCell = document.getElementById('cell' + val);
    thisCell.style.height = (cellW - 2) + 'px';
    thisCell.style.width = (cellW - 2) + 'px';
    thisCell.style.backgroundImage = `url('${bgSrc}')`;
    thisCell.style.backgroundSize = row+'00%';
    thisCell.style.backgroundPosition = (-val[1])*cellW + 'px ' + (-val[0])*cellW+'px';
    // 给元素对象的pro属性设置一个Proxy(代理),大概作用就是设置这个属性(pro)下面的属性的时候触发代理对象handler下面的set函数
    // 如果代理对象handler里设置了get属性(函数),那么每次使用目标对象下的属性时就触发get函数,如:console.log(thisCell.pro.pst)
    thisCell['pro'] = new Proxy(thisCell, {
      set(target, key, value, proxy){
        if(key === 'pst'){
          // 下面一设置thisCell.pro.pst的值的时候就给这个格子定位
          // console.log(target, key, value,value[1], proxy);
          target.style.top = value[0] * cellW + 'px';
          target.style.left = value[1] * cellW + 'px';
        }
        return Reflect.set(target, key, value, proxy);
      }
    });
    thisCell.pro.pst = val;
    return thisCell;
  };

  pstArr.forEach((v,i) => {
    let div = document.createElement('div');
    div.className = 'cell';
    div.id = 'cell'+v;
    if (i === lastNum) {
      div.style.cssText += 'border-color: transparent; opacity: 0.2; z-index: 1;';
      last = div;
    }
    wrap.appendChild(div);
    // 执行cellInit函数插入图片设置格子定位,并绑定点击事件
    cellInit(v).onclick = function() {
      // console.log([10,-10,1,-1].indexOf(last.pst - this.pst));
      // console.log(last.id,last.pst,this.id,this.pst,(last.pst - this.pst));
      // 这里的indexOf是判断是否点击了不占位的空格子周围(上下左右)的格子
      if ([10,-10,1,-1].indexOf(last.pst - this.pst) !== -1) {
        detime++;
        [this.pro.pst, last.pro.pst] = [last.pst, this.pst];// 解构赋值,交换点击的格子与空格子的位置
        time && isWin();// 时间戳存在就判断
      }else if (i !== lastNum) { // 无法换位
        this.style.opacity = 0.3;
        last.style.opacity = 1;
        let that = this;
        setTimeout(() => {
          that.style.opacity = 1;
          last.style.opacity = 0.2;
        }, 250);
      }
    }
  })

  let start = document.getElementById('start');
  start.onclick = () => {
    let newPstArr = [...pstArr], allpromise = [];
    let lastPst = newPstArr.pop(); // 弹出最后一个并存起
    do{
      newPstArr = shuffle(newPstArr);// 不断打乱数组,直到有解
    }
    while(!isValid(newPstArr)); // 直到它有解
    newPstArr.push(lastPst); // 有解后再插入最后一个,这样空格子就固定在右下角
    // Object.entries()方法返回一个给定对象自身可枚举属性的键值对数组,放数组进去的输出是0:["0", "02"]
    for(let [i,v] of Object.entries(newPstArr)){
      // let thisCell = window['cell' + pstArr[i]];
      let thisCell = document.getElementById('cell' + pstArr[i]);
      allpromise.push(new Promise((resolve, reject) => {
        setTimeout(()=>{
          thisCell.pro.pst = '00';// 把所有格子移动(定位)到左上角洗牌(打乱)
          resolve([thisCell, v]);
        }, 100 * i);
      }));
    }
    // 上面allpromise里的全部定时器执行完每个格子都到左上角后把每个格子的对象和随机好的定位坐标传下来,再执行这一步
    Promise.all(allpromise).then(res => {
      // console.log(allpromise,res);// res是一个数组,里面的值就是上面resolve里放进去的数组
      allpromise = [];
      for(let i of res){
        allpromise.push(new Promise((resolve, reject) => {
          setTimeout(function(){
            // console.log((20 - pstArr.indexOf(i[1])),pstArr,i[1],pstArr.indexOf(i[1]));
            i[0].pro.pst = i[1];// 把所有格子移动到随机好的坐标上
          }, 100*(20 - pstArr.indexOf(i[1])));// 最初一个格子0.5秒后动,第二个0.6,第三个0.7...
        }));
      }
    });
    // 上面的上面那个把所有格子都移动到左上角的Promise执行完后执行这个,res跟上面一样
    Promise.all(allpromise).then(res => {
      new Promise((resolve, reject) => {
        setTimeout(() => {// 初始化完成后就开始计时,开始计时后前面每个格子的点击事件里就会开始判断胜利
          time = new Date();
        });// setTimeout的第二个时间参数不填等于为0,为0也不是立即执行,只是尽可能比其他异步操作早执行
      });
    });
  }

  let isWin = () => {// 判断拼图名与位置是否全等
    for(let i of pstArr) {
      // if(window['cell' + i].pst !== i) return;
      let dom = document.getElementById('cell' + i);
      if(dom.pst !== i) return;
    }
    msg.style.display = "block";
    // msg.innerHTML = `<p>Nice! ${((new Date()-time)/1000)|0}s</p><button onclick='history.go(0)'>restart</button>`;
    msg.innerHTML = `<p>Nice! ${((new Date()-time)/1000)|0}s</p><button onclick='init()'>restart</button>`;
  };
}
