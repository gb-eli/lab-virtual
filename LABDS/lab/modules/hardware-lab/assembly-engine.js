'use strict';
(function(){
  // LABDS_LABS: recurso auxiliar carregado antes do módulo principal.
  const PARTS=['board','cpu','ram','gpu','storage','storage2','psu','cooler'];
  const LABELS={board:'Placa-mãe',cpu:'Processador',ram:'Memória RAM',gpu:'Placa de vídeo',storage:'Armazenamento principal',storage2:'Armazenamento secundário',psu:'Fonte de alimentação',cooler:'Sistema de refrigeração'};
  const TRAY_POSITIONS={
    board:[-7.2,.4,-1.8],cpu:[-7.3,2.55,.8],ram:[-6.25,2.35,-.45],gpu:[-6.45,-1.3,1.25],
    storage:[-7.25,1.7,-2.75],storage2:[-5.75,1.35,-2.65],psu:[-7.05,-2.35,-1.9],cooler:[-5.9,-.15,-2.5]
  };
  const HISTORY_LIMIT=40;
  const clone=value=>JSON.parse(JSON.stringify(value));
  const vectorArray=vector=>[Number(vector.x.toFixed(4)),Number(vector.y.toFixed(4)),Number(vector.z.toFixed(4))];

  function normalizeAssembly(raw={}){
    const placed={};
    const sourcePlaced=raw&&typeof raw.placed==='object'?raw.placed:{};
    for(const key of PARTS)placed[key]=sourcePlaced[key]!==false;
    return{
      enabled:Boolean(raw.enabled),
      prepared:Boolean(raw.prepared),
      placed,
      positions:raw&&typeof raw.positions==='object'?clone(raw.positions):{},
      rotations:raw&&typeof raw.rotations==='object'?clone(raw.rotations):{},
      attempts:Math.max(0,Number(raw.attempts)||0),
      successful:Math.max(0,Number(raw.successful)||0),
      invalid:Math.max(0,Number(raw.invalid)||0),
      history:Array.isArray(raw.history)?raw.history.slice(-HISTORY_LIMIT):[],
      future:Array.isArray(raw.future)?raw.future.slice(-HISTORY_LIMIT):[],
      lastAction:String(raw.lastAction||'')
    };
  }

  class HardwareAssemblyEngine{
    constructor(options){
      this.THREE=options.THREE;
      this.canvas=options.canvas;
      this.camera=options.camera;
      this.root=options.root;
      this.partGroups=options.partGroups||{};
      this.state=options.state;
      this.activeParts=options.activeParts||(()=>PARTS);
      this.validate=options.validate||(()=>({ok:true,message:'Encaixe disponível.'}));
      this.onChange=options.onChange||(()=>{});
      this.onSelect=options.onSelect||(()=>{});
      this.onMessage=options.onMessage||(()=>{});
      this.snapDistance=Number(options.snapDistance)||1.35;
      this.constrain=typeof options.constrain==='function'?options.constrain:null;
      this.externalCollision=typeof options.externalCollision==='function'?options.externalCollision:null;
      this.raycaster=new this.THREE.Raycaster();
      this.pointer=new this.THREE.Vector2();
      this.dragPlane=new this.THREE.Plane();
      this.dragPoint=new this.THREE.Vector3();
      this.dragOffset=new this.THREE.Vector3();
      this.dragging=null;
      this.targets={};
      this.targetRoot=new this.THREE.Group();
      this.targetRoot.name='assembly-targets';
      this.root.add(this.targetRoot);
      this.base={};
      this._captureTargets();
      this.applyState();
    }

    _captureTargets(){
      for(const key of PARTS){
        const group=this.partGroups[key];
        if(!group)continue;
        const basePosition=group.userData.basePosition||group.position;
        this.base[key]={position:basePosition.clone(),rotation:group.rotation.clone()};
        const box=new this.THREE.Box3().setFromObject(group);
        const size=box.getSize(new this.THREE.Vector3());
        size.x=Math.max(.28,size.x);size.y=Math.max(.28,size.y);size.z=Math.max(.28,size.z);
        const geometry=new this.THREE.BoxGeometry(size.x,size.y,size.z);
        const material=new this.THREE.MeshBasicMaterial({color:0x41e7a8,wireframe:true,transparent:true,opacity:.25,depthWrite:false});
        const target=new this.THREE.Mesh(geometry,material);
        target.position.copy(basePosition);
        target.rotation.copy(group.rotation);
        target.visible=false;
        target.renderOrder=5;
        this.targetRoot.add(target);
        this.targets[key]=target;
      }
    }

    _activeSet(){return new Set(this.activeParts().filter(key=>PARTS.includes(key)));}

    _snapshot(){
      const positions={},rotations={};
      for(const key of PARTS){
        const group=this.partGroups[key];if(!group)continue;
        positions[key]=vectorArray(group.position);
        rotations[key]=vectorArray(group.rotation);
      }
      return{placed:clone(this.state.assembly.placed),positions,rotations};
    }

    _restore(snapshot,notify=true){
      if(!snapshot)return;
      this.state.assembly.placed={...this.state.assembly.placed,...clone(snapshot.placed||{})};
      this.state.assembly.positions=clone(snapshot.positions||{});
      this.state.assembly.rotations=clone(snapshot.rotations||{});
      this.applyState();
      if(notify)this.onChange({type:'restore',assembly:this.state.assembly});
    }

    _pushHistory(label){
      const assembly=this.state.assembly;
      assembly.history.push({label:String(label||'Alteração'),snapshot:this._snapshot(),at:new Date().toISOString()});
      assembly.history=assembly.history.slice(-HISTORY_LIMIT);
      assembly.future=[];
    }

    _storeCurrent(){
      const assembly=this.state.assembly;
      assembly.positions={};assembly.rotations={};
      for(const key of PARTS){
        const group=this.partGroups[key];if(!group)continue;
        assembly.positions[key]=vectorArray(group.position);
        assembly.rotations[key]=vectorArray(group.rotation);
      }
    }

    applyState(){
      const assembly=this.state.assembly;
      const active=this._activeSet();
      for(const key of PARTS){
        const group=this.partGroups[key],target=this.targets[key],base=this.base[key];
        if(!group||!base)continue;
        const isActive=active.has(key);
        const placed=!isActive||assembly.placed[key]!==false;
        group.visible=isActive||placed;
        if(!assembly.enabled||!assembly.prepared){
          group.position.copy(base.position);group.rotation.copy(base.rotation);
        }else if(placed){
          group.position.copy(base.position);group.rotation.copy(base.rotation);
        }else{
          const stored=assembly.positions[key];
          const tray=TRAY_POSITIONS[key]||[5,0,0];
          group.position.set(...(Array.isArray(stored)&&stored.length===3?stored:tray));
          const rotation=assembly.rotations[key];
          if(Array.isArray(rotation)&&rotation.length===3)group.rotation.set(...rotation);else group.rotation.copy(base.rotation);
        }
        if(target){
          const validation=this.validate(key);
          target.visible=Boolean(assembly.enabled&&assembly.prepared&&isActive&&!placed);
          target.material.color.set(validation.ok?0x41e7a8:0xff5d78);
          target.material.opacity=validation.ok?.3:.2;
        }
      }
      this._storeCurrent();
    }

    prepare(){
      this._pushHistory('Antes de preparar a bancada');
      const assembly=this.state.assembly,active=this._activeSet();
      assembly.enabled=true;assembly.prepared=true;
      for(const key of PARTS)assembly.placed[key]=!active.has(key);
      assembly.positions={};assembly.rotations={};assembly.lastAction='Bancada preparada';
      this.applyState();
      this.onMessage('Peças separadas na bancada. Arraste cada componente até o contorno de encaixe.','info');
      this.onChange({type:'prepare',assembly});
    }

    setEnabled(enabled){
      this.state.assembly.enabled=Boolean(enabled);
      if(!enabled)this.dragging=null;
      this.applyState();
      this.onChange({type:'toggle',enabled:Boolean(enabled),assembly:this.state.assembly});
    }

    reset(){
      this.prepare();
      this.state.assembly.attempts=0;this.state.assembly.successful=0;this.state.assembly.invalid=0;
      this.state.assembly.lastAction='Montagem reiniciada';
      this.onChange({type:'reset',assembly:this.state.assembly});
    }

    complete(){
      const active=this._activeSet();
      for(const key of active)if(this.state.assembly.placed[key]===false)return false;
      return true;
    }

    progress(){
      const active=[...this._activeSet()];
      const installed=active.filter(key=>this.state.assembly.placed[key]!==false).length;
      return{installed,total:active.length,percent:active.length?Math.round(installed/active.length*100):100};
    }

    selectAt(event){
      const hit=this._hit(event,false);if(!hit)return null;
      this.onSelect(hit.key);return hit.key;
    }

    _hit(event,manualOnly=true){
      const rect=this.canvas.getBoundingClientRect();
      this.pointer.x=(event.clientX-rect.left)/rect.width*2-1;
      this.pointer.y=-(event.clientY-rect.top)/rect.height*2+1;
      this.raycaster.setFromCamera(this.pointer,this.camera);
      const active=this._activeSet();
      const hit=this.raycaster.intersectObjects(Object.values(this.partGroups),true).find(item=>{
        const key=item.object.userData.partKey;
        return key&&(!manualOnly||active.has(key));
      });
      return hit?{hit,key:hit.object.userData.partKey,group:this.partGroups[hit.object.userData.partKey]}:null;
    }

    pointerDown(event){
      const assembly=this.state.assembly;
      if(!assembly.enabled||!assembly.prepared||event.button>0)return false;
      const result=this._hit(event,true);if(!result?.group)return false;
      const {key,group,hit}=result;
      this._pushHistory(`Antes de mover ${LABELS[key]||key}`);
      this.onSelect(key);
      const wasPlaced=assembly.placed[key]!==false;
      assembly.placed[key]=false;
      const worldPoint=hit.point.clone();
      const normal=this.camera.getWorldDirection(new this.THREE.Vector3());
      this.dragPlane.setFromNormalAndCoplanarPoint(normal,worldPoint);
      const groupWorld=group.getWorldPosition(new this.THREE.Vector3());
      this.dragOffset.copy(groupWorld).sub(worldPoint);
      this.dragging={key,group,wasPlaced,start:this._snapshot(),moved:false};
      this.canvas.setPointerCapture?.(event.pointerId);
      this.applyState();
      this._updateTarget(key);
      return true;
    }

    pointerMove(event){
      if(!this.dragging)return false;
      const rect=this.canvas.getBoundingClientRect();
      this.pointer.x=(event.clientX-rect.left)/rect.width*2-1;
      this.pointer.y=-(event.clientY-rect.top)/rect.height*2+1;
      this.raycaster.setFromCamera(this.pointer,this.camera);
      if(!this.raycaster.ray.intersectPlane(this.dragPlane,this.dragPoint))return true;
      const desired=this.dragPoint.clone().add(this.dragOffset);
      this.root.worldToLocal(desired);
      desired.x=Math.max(-9,Math.min(8.8,desired.x));
      desired.y=Math.max(-3.15,Math.min(4.8,desired.y));
      desired.z=Math.max(-5.2,Math.min(5.2,desired.z));
      const constrained=this.constrain?.(this.dragging.key,desired.clone(),this.dragging.group);
      if(constrained?.isVector3)desired.copy(constrained);else if(Array.isArray(constrained)&&constrained.length===3)desired.set(...constrained);
      this.dragging.group.position.copy(desired);
      this.dragging.moved=true;
      this._storeCurrent();
      this._updateTarget(this.dragging.key);
      return true;
    }

    _updateTarget(key){
      const target=this.targets[key],group=this.partGroups[key],base=this.base[key];if(!target||!group||!base)return;
      const validation=this.validate(key);
      const distance=group.position.distanceTo(base.position);
      const near=distance<=this.snapDistance;
      target.material.color.set(!validation.ok?0xff5d78:near?0xffd166:0x41e7a8);
      target.material.opacity=near?.55:.28;
    }

    _hasCollision(key){
      const group=this.partGroups[key];if(!group)return false;
      if(this.externalCollision?.(key,group))return true;
      const movingBox=new this.THREE.Box3().setFromObject(group).expandByScalar(-.04);
      for(const otherKey of this._activeSet()){
        if(otherKey===key||this.state.assembly.placed[otherKey]===false)continue;
        const other=this.partGroups[otherKey];if(!other)continue;
        const otherBox=new this.THREE.Box3().setFromObject(other).expandByScalar(-.04);
        if(movingBox.intersectsBox(otherBox))return true;
      }
      return false;
    }

    pointerUp(){
      if(!this.dragging)return false;
      const {key,group,wasPlaced,moved}=this.dragging,assembly=this.state.assembly,base=this.base[key];
      this.dragging=null;
      if(!moved){
        assembly.placed[key]=wasPlaced;
        this.applyState();
        assembly.history.pop();
        return true;
      }
      assembly.attempts++;
      const distance=group.position.distanceTo(base.position);
      const validation=this.validate(key);
      if(distance<=this.snapDistance&&validation.ok){
        group.position.copy(base.position);group.rotation.copy(base.rotation);
        assembly.placed[key]=true;assembly.successful++;assembly.lastAction=`${LABELS[key]||key} encaixado`;
        this.onMessage(`Encaixe concluído: ${LABELS[key]||key}.`,'success');
        this.onChange({type:'placed',key,placed:true,message:validation.message,assembly});
      }else if(distance<=this.snapDistance&&!validation.ok){
        assembly.invalid++;assembly.placed[key]=false;assembly.lastAction=`Encaixe bloqueado: ${LABELS[key]||key}`;
        const tray=TRAY_POSITIONS[key]||[5,0,0];group.position.set(...tray);
        this.onMessage(validation.message||`O encaixe de ${LABELS[key]||key} não foi liberado.`,'error');
        this.onChange({type:'invalid',key,message:validation.message,assembly});
      }else if(this._hasCollision(key)){
        assembly.invalid++;assembly.placed[key]=false;assembly.lastAction=`Colisão detectada: ${LABELS[key]||key}`;
        const tray=TRAY_POSITIONS[key]||[5,0,0];group.position.set(...tray);
        this.onMessage(`${LABELS[key]||key} colidiu com uma peça já instalada e voltou para a bancada.`,'warning');
        this.onChange({type:'collision',key,assembly});
      }else{
        assembly.placed[key]=false;assembly.lastAction=`${LABELS[key]||key} removido ou reposicionado`;
        this.onMessage(`${LABELS[key]||key} permanece fora do encaixe.`,'info');
        this.onChange({type:'detached',key,placed:false,assembly});
      }
      this._storeCurrent();this.applyState();
      return true;
    }

    rotate(key,direction=1){
      if(!this.state.assembly.enabled||!this.state.assembly.prepared)return false;
      const group=this.partGroups[key];if(!group||!this._activeSet().has(key))return false;
      this._pushHistory(`Antes de girar ${LABELS[key]||key}`);
      this.state.assembly.placed[key]=false;
      group.rotation.y+=Number(direction)>=0?Math.PI/12:-Math.PI/12;
      this._storeCurrent();this.state.assembly.lastAction=`${LABELS[key]||key} girado`;
      this.onChange({type:'rotate',key,direction,assembly:this.state.assembly});
      return true;
    }

    snap(key){
      if(!this.state.assembly.enabled||!this.state.assembly.prepared)return false;
      const group=this.partGroups[key],base=this.base[key];if(!group||!base||!this._activeSet().has(key))return false;
      const validation=this.validate(key);
      this.state.assembly.attempts++;
      if(!validation.ok){
        this.state.assembly.invalid++;this.onMessage(validation.message,'error');this.onChange({type:'invalid',key,message:validation.message,assembly:this.state.assembly});return false;
      }
      this._pushHistory(`Antes do encaixe assistido de ${LABELS[key]||key}`);
      group.position.copy(base.position);group.rotation.copy(base.rotation);this.state.assembly.placed[key]=true;this.state.assembly.successful++;
      this.state.assembly.lastAction=`${LABELS[key]||key} encaixado com assistência`;
      this._storeCurrent();this.applyState();this.onMessage(`Encaixe assistido concluído: ${LABELS[key]||key}.`,'success');this.onChange({type:'placed',key,placed:true,assisted:true,assembly:this.state.assembly});return true;
    }

    undo(){
      const assembly=this.state.assembly,entry=assembly.history.pop();if(!entry)return false;
      assembly.future.push({label:entry.label,snapshot:this._snapshot(),at:new Date().toISOString()});
      assembly.future=assembly.future.slice(-HISTORY_LIMIT);this._restore(entry.snapshot,false);assembly.lastAction=`Desfeito: ${entry.label}`;this.onChange({type:'undo',label:entry.label,assembly});return true;
    }

    redo(){
      const assembly=this.state.assembly,entry=assembly.future.pop();if(!entry)return false;
      assembly.history.push({label:entry.label,snapshot:this._snapshot(),at:new Date().toISOString()});
      assembly.history=assembly.history.slice(-HISTORY_LIMIT);this._restore(entry.snapshot,false);assembly.lastAction=`Refeito: ${entry.label}`;this.onChange({type:'redo',label:entry.label,assembly});return true;
    }

    destroy(){
      this.dragging=null;
      if(this.targetRoot?.parent)this.targetRoot.parent.remove(this.targetRoot);
      this.targetRoot?.traverse?.(node=>{node.geometry?.dispose?.();node.material?.dispose?.();});
      this.targets={};this.partGroups={};
    }
  }

  window.LABDS_HARDWARE_ASSEMBLY={
    PARTS,LABELS,normalizeAssembly,
    create:options=>new HardwareAssemblyEngine(options)
  };
})();
