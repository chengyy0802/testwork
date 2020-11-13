class Vue{
  constructor(options){
    this.$options = options;
    this.$data = options.data;
    this.observe(this.$data);
    this.compile();
  }
  // Object.defineProperty方法监听获取、设置数据
  observe(data){
    let keys = Object.keys(data);
    keys.forEach(key=>{
      let value = data[key];
      let _this = this;
      let dep = new Dep();
      Object.defineProperty(data,key,{
        configurable:true,
        enumerable:true,
        get(){
          console.log('get...')
          if(Dep.target){
            dep.addSub(Dep.target);
          }
          return value;
        },
        set(newValue) {
          console.log('set.....'+newValue)
          dep.notify(newValue);
          value = newValue;
          console.log('efe')
          // 发布一个监听事件
          // _this.dispatchEvent(new CustomEvent(key,{detail:value}));
        }
      })
    })
  }
  // 递归遍历所有元素，获取大胡子语法并渲染输入
  compileNodes(ele){
    let childNodes = ele.childNodes;
    [...childNodes].forEach(node=>{
      if(node.nodeType==1){//元素
        if(node.childNodes.length>0){
          this.compileNodes(node)
        }
      }else if(node.nodeType==3){//文本
        let reg = /\{\{\s*([^\{\}\s]+)\s*\}\}/g
        if(reg.test(node.textContent)){
          let $1 = RegExp.$1;
          let newValue = node.textContent.replace(reg,this.$data[$1]);
          node.textContent = newValue;
          // 监听对象属性值发生改变的事件
          new Watcher(this.$data,$1,(newValue)=>{
            let oldValue = this.$data[$1];
                      let reg = new RegExp(oldValue);
                      node.textContent = node.textContent.replace(reg, newValue);
          })
        }
        
      }
    })
  }
  compile(){
    let ele = document.querySelector(this.$options.el);
    this.compileNodes(ele);
  }
  // 遍历app节点下所有大胡子语法并渲染

}
class Dep{
  constructor(){
    this.subs = [];
  }
  // 添加监听
  addSub(sub){
    this.subs.push(sub);
  }
  // 发布通知
  notify(newValue){
    for(let i = 0;i<this.subs.length;i++){
      console.log('notify')
      this.subs[i].update(newValue);
    }
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
    // 更新视图
    this.cb(newValue);
  }
}