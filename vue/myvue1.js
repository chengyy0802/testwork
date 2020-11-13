class Vue {
  constructor(options) {
      this.$options = options;
      this.$data = options.data;
      this.observe(this.$data);
      this.compile();
  }
  observe(data) {
      // 数据劫持
      let keys = Object.keys(data);
      //  data[key] ---> get ---> data[key]
      // data[key] --->get
      keys.forEach(key => {
          let value = data[key];
          let _this = this;
          // 管理器
          let dep = new Dep();
          Object.defineProperty(data, key, {
              configurable: true,
              enumerable: true,
              get() {
                  console.log("get...");
                  // 收集watcher；
                  if (Dep.target) {
                      dep.addSub(Dep.target);
                  }
                  // 收集watcher；
                  // return data[key];
                  return value;
              },
              set(newValue) {
                  console.log("set...");
                  // 触发notify ---> watcher -->update--->cb--->视图更新；
                  // 触发编译渲染视图
                  // 渲染视图；
                  console.log(dep)
                  dep.notify(newValue);
                  value = newValue;
              }
          })
      })
  }

  compile() {
      let ele = document.querySelector(this.$options.el);
      // console.log(ele);
      this.compileNodes(ele);
  }
  compileNodes(ele) {
      let childNodes = ele.childNodes;
      [...childNodes].forEach(node => {
          // console.log(node);
          if (node.nodeType === 3) {
              // console.log("文本",node.textContent);
              // 查找大胡子语法；
              // 正则表达式查找大胡子语法；{{mydata}}
              let reg = /\{\{\s*([^\{\}\s]+)\s*\}\}/g;
              if (reg.test(node.textContent)) {
                  console.log("有大胡子语法");
                  let $1 = RegExp.$1;
                  // $1  --->messgae
                  // console.log(this.$data[$1]);
                  // console.log($1,RegExp.$2)
                  let res = node.textContent.replace(reg, this.$data[$1]);
                  //   console.log(res);
                  node.textContent = res;
                  // 编译视图；
                  // this.addEventListener($1,e=>{
                  //     // console.log("设置了",e.detail);
                  //     let newValue = e.detail;
                  //     let oldValue = this.$data[$1];
                  //     let reg = new RegExp(oldValue);
                  //     node.textContent = node.textContent.replace(reg,newValue);
                  // })
                  new Watcher(this.$data, $1, (newValue) => {
                      console.log("更新视图", newValue);
                      let oldValue = this.$data[$1];
                      let reg = new RegExp(oldValue);
                      node.textContent = node.textContent.replace(reg, newValue);
                  })
              }
          } else if (node.nodeType === 1) {
              // console.log("元素标签");
              // console.log(node);
              let attrs = node.attributes;
              [...attrs].forEach(attr => {
                  let attrName = attr.name;
                  let attrValue = attr.value;
                  // console.log(attrName, attrValue);

                  if(attrName==="v-model"){
                      node.value = this.$data[attrValue];
                      node.addEventListener("input",e=>{
                          // console.log(e.target.value);
                          // 自动响应；
                          this.$data[attrValue] = e.target.value;
                      })
                  }else if(attrName=='v-html'){
                    node.innerHTML = this.$data[attrValue];
                    new Watcher(this.$data,attrValue,(newValue)=>{
                      node.innerHTML = newValue;
                    })
                  }

                  //作业： 实现一个 v-html 指令；
              })




              if (node.childNodes.length > 0) {
                  this.compileNodes(node);
              }
          }
      })
  }
}

// 管理器；
class Dep {
  constructor() {
      this.subs = [];
  }
  addSub(sub) {
      this.subs.push(sub);
  }
  notify(newValue) {
      this.subs.forEach(sub => {
          sub.update(newValue);
      })
  }
}


class Watcher {
  constructor(data, key, cb) {
      Dep.target = this;
      data[key];  //触发get 收集watcher
      this.cb = cb;
      Dep.target = null;
  }
  update(newValue) {
      this.cb(newValue);
  }
}
