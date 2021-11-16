export class Timeline{
    nodes;  //TimelineNode[] timeline的节点
    timeElapsed;    //运行了多少个毫秒了

    constructor(){
        this.nodes = [];
        this.timeElapsed = 0;
    }

    FreeNow(){
        return this.nodes.length <= 0;
    }

    Update(delta){
        this.timeElapsed += delta;
        let i = 0;
        while (i < this.nodes.length){
            this.nodes[i].Update(delta);
            if (this.nodes[i].done === true){
                if (this.nodes[i].nextNodes){
                    for (let m = 0; m < this.nodes[i].nextNodes.length; m++){
                        this.nodes.push(this.nodes[i].nextNodes[m]);
                    }
                }
                this.nodes.splice(i, 1);
            }else{
                i += 1;
            }
        }
    }

    AddTimelineNode(node, reset = true){
        this.nodes.push(node);
        if (reset === true){
            this.timeElapsed = 0;
            this.done = false;
        }
    }
}

export class TimelineNode{
    timeElapsed;    //int，运行了多久了
    target;         //any，timeline运行的对象是谁
    tween;          //(target, timeElapsed)=>boolean，传过去timeline焦点是谁，和timeElapsed，返回是否完成了
    nextNodes;      //TimelineNode[]，运行完之后要运行;
    done;           //boolean是否完事儿了

    constructor(target, tween, nextNodes = []){
        this.target = target;
        this.tween = tween;
        this.timeElapsed = 0;
        this.done = false;
        this.nextNodes = nextNodes;
    }

    Update(delta){
        if (this.done ===true) return;

        if (this.tween){
            this.done = this.tween(this.target, this.timeElapsed);
        }else{
            this.done = true;
        }

        this.timeElapsed += delta;
    }
}
