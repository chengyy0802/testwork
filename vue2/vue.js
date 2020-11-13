class Vue {
  constructor(options){
    this.$options = options;
    this.$data = options.data;
    this.obServer();
    this.compile();
  }
  obServer(){
    let keys = Object.keys(this.$data);
    keys.forEach(key=>{
      let dep = new Dep();
      let value = this.$data[key];
      Object.defineProperty(this.$data,key,{
        configurable:true,
        enumerable:true,
        get(){
          console.log('get...')
          if(Dep.target){
            dep.addSub(Dep.target);
          }
          return value;
        },
        set(newValue){
          console.log('set..')
          dep.notify(newValue);
          value = newValue;
        }
      })
    })
  }
  compile(){
    let ele = document.querySelector(this.$options.el);
    this.getAllNodes(ele);
  }
  getAllNodes(ele){
    let allNodes = ele.childNodes;
    [...allNodes].forEach((node)=>{
      if(node.nodeType==1){//元素
        let attrs = node.attributes;
        if(attrs.length>0){
          [...attrs].forEach((attr)=>{
            let attrName = attr.name;
            let attrValue = attr.value;
            if(attrName=='v-model'){
              node.value = this.$data[attrValue];
              node.addEventListener('input',()=>{
                this.$data[attrValue] = node.value; 
              })
            }else if(attrName=='v-html'){
              node.innerHTML = this.$data[attrValue];
              new Watcher(this.$data,attrValue,(newValue)=>{
                node.innerHTML = newValue;
              })
            }
          })
        }
        // 数据库系统的组成：用户、应用程序、数据库管理系统、数据库、数据库管理员
        // 数据库是指数据长期存储在计算机中的有组织的、可共享的数据集合
        this.getAllNodes(node);
      }else if(node.nodeType==3){//文本
        let reg = /\{\{\s*([^\n\r]+)\s*\}\}/g
        if(reg.test(node.textContent)){
          let $1 = RegExp.$1;
          node.textContent = node.textContent.replace(reg,this.$data[$1]);

          new Watcher(this.$data,$1,(newValue)=>{
            console.log('数据发生改变::'+newValue)
            let oldValue = this.$data[$1];
            let reg = new RegExp(oldValue);
            node.textContent = node.textContent.replace(reg,newValue);
          })
        }
      }
    })
  }
}
class Dep {
  constructor(){
    this.subs = [];
  }
  addSub(sub){
    this.subs.push(sub)
  }
  notify(newValue){
    this.subs.forEach(sub=>{
      sub.update(newValue);
    })
  }
}
class Watcher{
  constructor(data,key,cb){
    Dep.target = this;
    data[key];
    this.cb = cb;
    Dep.target = null;
  }
  update(newValue){
    this.cb(newValue);
  }
}