class Vue{
  constructor(options){
    this.$options = options;
    this.$data = options.data;
    this.observe(this.$data);
    this.compile();
  }
  // 数据响应
  observe(data){
    let keys = Object.keys(data);
    keys.forEach(key=>{
      let dep = new Dep();
      let value = data[key];
      Object.defineProperty(this.$data,key,{
        configurable:true,
        enumerable:true,
        get(){
          if(Dep.target){
            dep.addSub(Dep.target);
          }
          return value;
        },
        set(newValue){
          dep.notify(newValue);
          value = newValue;
        }
      })
    })
  } 
  // 初次渲染
  compile(){  
    let ele = document.querySelector(this.$options.el);
    this.getAllNodes(ele);
  }
  getAllNodes(ele){
    let nodeArray = ele.childNodes;
    nodeArray.forEach(node=>{
      
      if(node.nodeType==1){
        // 元素
        this.getAllNodes(node);
        // node.attributes
        if(node.attributes.length>0){
          let attrs = node.attributes;
          [...attrs].forEach(attr=>{
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
      }else if(node.nodeType==3){ //文本
        let reg = /\{\{\s*([^\n\r]+)\s*\}\}/g
        if(reg.test(node.textContent)){
          // 获取匹配的字符串
          let regData = node.textContent.match(reg);
          // 获取属性
          let $1 = RegExp.$1;
          node.textContent = node.textContent.replace(regData,this.$data[$1]);

          // 更新视图
          new Watcher(this.$data,$1,(newValue)=>{
            let oldValue = this.$data[$1]
            let reg = new RegExp(oldValue);
            node.textContent = node.textContent.replace(reg,newValue)
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
    this.subs.push(sub);
  }
  notify(newValue){
    this.subs.forEach(sub=>{
      sub.update(newValue)
    })
  }
}
class Watcher {
  constructor(data,key,cb){
    Dep.target = this;
    data[key]
    this.cb = cb;
    Dep.target = null;
  }
  update(newValue) {
    this.cb(newValue);
  }
}