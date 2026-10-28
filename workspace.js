/* Workspace presentation composes the existing registry and homepage preference.
 * No App routing, permissions, user data or official writes occur here. */
const WORKSPACE_CATEGORIES = Object.freeze([
  {id:"area-1",title:"App",order:0,enabled:true},
  {id:"area-2",title:"銷售流程",order:1,enabled:true},
  {id:"area-3",title:"高端市場",order:2,enabled:true}
]);
let favoritePage = 0;
let registryFormDraft={};
let registryEditingId="";
function workspaceCategories(config=officialHomepageDefault){return config.categories||WORKSPACE_CATEGORIES}
function workspaceAppLabel(id){
  const module=getModule(id),override=homepagePreference.officialOverrides[id];
  return override?.title??officialHomepageDefault.items.find(card=>card.moduleKey===id||card.id===id)?.title??module?.displayNameZh??module?.name??id;
}
function acceptOfficialHomepage(config){
  // Registry validation happens before cache promotion in homepage-cloud.js.
  registryState.modules=AVAHomepageCloud.mergeRegistry(MODULE_REGISTRY,config.registrations||[]);
  officialHomepageDefault=config;
}
// Favorites are explicit user shortcuts, never inferred from homepage defaults.
function storedFavoriteIds(){return homepagePreference.favoriteIds??[]}
function favoriteIds(){
  return storedFavoriteIds().filter(id=>{const app=getModule(id);return app?.allowFavorite&&supportsAppSurface(app,"frontend")});
}
function setFavorite(id,enabled){
  const app=getModule(id);if(!app?.allowFavorite||!supportsAppSurface(app,"frontend"))return;
  if(enabled&&storedFavoriteIds().includes(id))return;
  const ids=storedFavoriteIds().filter(value=>value!==id);if(enabled)ids.push(id);
  homepagePreference.favoriteIds=ids;saveHomepagePreference();renderModules();
}
function moveFavorite(id,delta){const visible=favoriteIds(),from=visible.indexOf(id),to=from+delta;if(from<0||to<0||to>=visible.length)return;const ids=storedFavoriteIds().slice(),left=ids.indexOf(id),right=ids.indexOf(visible[to]);[ids[left],ids[right]]=[ids[right],ids[left]];homepagePreference.favoriteIds=ids;saveHomepagePreference();renderModules()}
function workspaceButton(label,action,cls="secondary-button"){const button=document.createElement("button");button.type="button";button.className=cls;button.textContent=label;button.onclick=event=>{event.stopPropagation();action()};return button}
function scrollWorkspace(id){document.getElementById(id)?.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});closeSidebar()}
function workspaceAppCard(module,{favorite=false}={}){
  const presentation=homepageState().official.find(card=>card.id===module.id);
  const card=createModuleCard(module,false,presentation);card.classList.add("workspace-app-card");
  if(editMode){
    // The outer card is not an interactive button while it contains controls.
    card.removeAttribute("role");card.removeAttribute("tabindex");
    const controls=document.createElement("div");controls.className="workspace-card-controls";
    controls.append(workspaceButton("改顯示名稱",()=>openWorkspaceAppLabel(module.id)));
    if(module.allowFavorite){const shortcut=workspaceButton(favorite?"移除常用捷徑":favoriteIds().includes(module.id)?"已在常用 App":"移到常用 App",()=>setFavorite(module.id,!favorite));shortcut.disabled=!favorite&&favoriteIds().includes(module.id);controls.append(shortcut);}
    if(!favorite&&presentation){controls.append(cardMoveSelect("official",module.id,presentation.areaId||"area-1",presentation.folderId||""),cardOrderSelect("official",module.id,presentation.areaId||"area-1",presentation.folderId||""),workspaceButton("從首頁隱藏",()=>hideOfficialModule(module.id)));}
    if(favorite){const ids=favoriteIds(),index=ids.indexOf(module.id);const previous=workspaceButton("往前",()=>moveFavorite(module.id,-1)),next=workspaceButton("往後",()=>moveFavorite(module.id,1));previous.disabled=index===0;next.disabled=index===ids.length-1;controls.append(previous,next)}
    card.append(controls);
  }
  return card;
}
function openWorkspaceAppLabel(id){
  // Existing card editor and same officialOverrides field, including for Apps
  // omitted from legacy homepage_cards. No duplicate label store.
  const current=homepageState().official.find(card=>card.id===id);
  if(current){openOfficialCardForm(id);return}
  const module=getModule(id);officialCardId.value=id;officialCardTitle.value=workspaceAppLabel(id);officialCardSubtitle.value=module.description||"";officialCardEmoji.value="";officialCardArea.value="area-1";openOverlay("officialCardOverlay");
}
function carouselCount(width=window.innerWidth){return width<=650?2:width<=1000?3:4}
function renderFavorites(){
  const root=document.getElementById("favoritesCarousel"),ids=favoriteIds(),count=carouselCount(),pages=Math.ceil(ids.length/count);
  favoritePage=Math.max(0,Math.min(favoritePage,pages-1));root.replaceChildren();root.setAttribute("role","region");root.setAttribute("aria-label","常用 App 輪播");root.setAttribute("aria-roledescription","輪播");root.tabIndex=0;
  const grid=document.createElement("div");grid.className="grid favorites-grid";grid.style.setProperty("--favorites-count",count);
  ids.slice(favoritePage*count,(favoritePage+1)*count).forEach(id=>grid.append(workspaceAppCard(getModule(id),{favorite:true})));
  if(!ids.length){const empty=document.createElement("p");empty.className="config-help";empty.textContent="按右上角「編輯」，從銷售 App 加入常用捷徑。";root.append(empty)}else root.append(grid);
  const change=page=>{favoritePage=Math.max(0,Math.min(page,pages-1));renderFavorites();root.focus({preventScroll:true})};
  if(pages>1){
    const controls=document.createElement("div");controls.className="carousel-controls";
    const prev=workspaceButton("←",()=>change(favoritePage-1)),next=workspaceButton("→",()=>change(favoritePage+1));prev.setAttribute("aria-label","上一組常用 App");next.setAttribute("aria-label","下一組常用 App");prev.disabled=favoritePage===0;next.disabled=favoritePage===pages-1;controls.append(prev);
    for(let i=0;i<pages;i++){const dot=workspaceButton("●",()=>change(i),"carousel-dot");dot.setAttribute("aria-label",`常用 App 第 ${i+1} 組`);if(i===favoritePage)dot.setAttribute("aria-current","true");controls.append(dot)}controls.append(next);root.append(controls);
  }
  const status=document.createElement("span");status.className="ava-caption";status.setAttribute("aria-live","polite");status.textContent=pages?`${favoritePage+1} / ${pages}`:"";root.append(status);
  root.onkeydown=event=>{if(event.target!==root)return;const actions={ArrowRight:favoritePage+1,ArrowLeft:favoritePage-1,Home:0,End:pages-1};if(event.key in actions){event.preventDefault();change(actions[event.key])}};
  let touch=null;root.ontouchstart=event=>{const t=event.changedTouches[0];touch={x:t.clientX,y:t.clientY}};
  root.ontouchend=event=>{if(!touch)return;const t=event.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;touch=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))change(favoritePage+(dx<0?1:-1))};
}
function workspaceCategoryOrder(){try{return JSON.parse(localStorage.getItem(STORAGE.homepageOrder)||localStorage.getItem("ava_homepage_order")||"[]").map(id=>({tools:"area-1",flow:"area-2",resources:"area-3"}[id]||id))}catch(_){return []}}
function renderWorkspace(){
  renderFavorites();
  for(const selectId of ["officialCardArea","personalCardArea","folderEditorArea","availableAppArea"]){const select=document.getElementById(selectId);if(!select)continue;const previous=select.value;select.replaceChildren(...workspaceCategories().map(c=>new Option(homepagePreference.areaOverrides[c.id]||c.title,c.id)));if([...select.options].some(o=>o.value===previous))select.value=previous;}
  const state=homepageState(),visible=registeredModulesForSurface("frontend"),root=document.getElementById("homeSections");root.replaceChildren();
  const ordered=workspaceCategories().filter(c=>c.enabled!==false).slice().sort((a,b)=>{const order=workspaceCategoryOrder();return (order.includes(a.id)?order.indexOf(a.id):a.order+9)-(order.includes(b.id)?order.indexOf(b.id):b.order+9)});
  ordered.forEach(category=>{
    const section=document.createElement("section");section.className="workspace-category card";section.dataset.area=category.id;section.dataset.section={"area-1":"tools","area-2":"flow","area-3":"resources"}[category.id]||category.id;
    const heading=document.createElement("div");heading.className="section-header";const title=document.createElement("h3");title.id=`${category.id}-title`;title.textContent=homepagePreference.areaOverrides[category.id]||category.title;heading.append(title);
    if(editMode){const actions=document.createElement("div");actions.className="workspace-card-controls";actions.append(workspaceButton("改顯示名稱",()=>openAreaEditor(category.id)));const select=document.createElement("select");select.className="move-select";select.setAttribute("aria-label",`${category.title} 排序`);ordered.forEach((c,i)=>{select.add(new Option(`位置 ${i+1}`,String(i),false,c.id===category.id))});select.onchange=()=>{const ids=ordered.map(c=>c.id).filter(id=>id!==category.id);ids.splice(Number(select.value),0,category.id);localStorage.setItem(STORAGE.homepageOrder,JSON.stringify(ids));renderModules()};actions.append(select);heading.append(actions)}
    section.append(heading);
    if(category.id==="area-1"){
      const group=document.createElement("div");group.className="workspace-card-controls";group.append(workspaceButton("銷售 App",openToolLibrary),workspaceButton("內地銷售 App",()=>openSalesAppDirectory("mainland")));section.append(group);
    }
    if(category.id==="area-2")section.append(workspaceButton("我的銷售流程",()=>openModuleDirectory("user")));
    const grid=document.createElement("div");grid.id=`${category.id}-grid`;grid.className="grid workspace-content-grid";
    (state.areas[category.id]||[]).forEach(item=>{
      if(item.kind==="personal")grid.append(createPersonalCard(item));
      else if(getModule(item.moduleKey||item.id))grid.append(workspaceAppCard(getModule(item.moduleKey||item.id)));
      else grid.append(workspaceContentCard(item));
    });
    if(editMode&&officialHomepageDefault.settings?.personalCardsEnabled!==false)grid.append(workspaceButton("＋ 新增卡片",()=>{openPersonalCardForm();personalCardArea.value=category.id}));
    section.append(grid);
    const folders=document.createElement("div");folders.id=`${category.id}-folders`;folders.className="folder-list";
    // Existing folders remain lossless and visible. Creation is no longer offered.
    state.folders.filter(folder=>folder.areaId===category.id).forEach(folder=>folders.append(folderCard(folder,state)));section.append(folders);root.append(section);
  });
  const library=document.getElementById("toolLibraryModules");library.replaceChildren(...visible.map(module=>workspaceAppCard(module)));
  // The legacy flow list remains available through its existing directory route.
}
function workspaceContentCard(item){const card=document.createElement("article");card.className="card homepage-card";const title=document.createElement("h3"),body=document.createElement("p");title.textContent=item.title;body.textContent=item.subtitle;card.append(title,body);if(editMode){const controls=document.createElement("div");controls.className="workspace-card-controls";controls.append(workspaceButton("修改",()=>openOfficialCardForm(item.id)),cardMoveSelect("official",item.id,item.areaId),cardOrderSelect("official",item.id,item.areaId),workspaceButton("從首頁隱藏",()=>hideOfficialModule(item.id)));card.append(controls);}return card}
function openSalesAppDirectory(market){const modules=registeredModulesForSurface("frontend").filter(app=>app.market===market);document.getElementById("moduleDirectoryTitle").textContent="內地銷售 App";document.getElementById("moduleDirectoryHelp").textContent=modules.length?"選擇 App":"暫時沒有已註冊的內地銷售 App。";document.getElementById("moduleDirectoryList").replaceChildren(...modules.map(app=>workspaceAppCard(app)));openOverlay("moduleDirectoryOverlay")}
function workspaceStudioDirty(){return JSON.stringify(AVAHomepageCloud.cardsForWrite(studioDraft))!==JSON.stringify(AVAHomepageCloud.cardsForWrite(officialHomepageDefault))||JSON.stringify(studioDraft.categories||WORKSPACE_CATEGORIES)!==JSON.stringify(officialHomepageDefault.categories||WORKSPACE_CATEGORIES)}
function renderWorkspaceAdmin(){
  const root=document.getElementById("studioRegistry");root.replaceChildren();
  const title=document.createElement("h3");title.textContent="Independent App 註冊";root.append(title);
  const selector=document.createElement("select");selector.className="setting-input";selector.setAttribute("aria-label","選擇官方 App 記錄");selector.add(new Option("新增 Independent App",""));registryState.modules.forEach(app=>selector.add(new Option(officialHomepageDefault.items.find(c=>c.moduleKey===app.id)?.title||app.displayNameZh||app.name,app.id)));selector.value=registryEditingId;
  selector.onchange=()=>{registryEditingId=selector.value;const app=getModule(registryEditingId);registryFormDraft=app?{id:app.id,name:officialHomepageDefault.items.find(c=>c.moduleKey===app.id)?.title||app.displayNameZh||app.name,entry:app.entry,category:app.category,order:app.order,enabled:app.enabled,market:app.market||""}:{};renderWorkspaceAdmin()};root.append(selector);
  const form=document.createElement("form");form.className="registry-form";
  const fields={id:"App ID（建立後不可改）",name:"官方名稱",entry:"官方 HTTPS 部署網址",category:"官方分類",order:"官方排序"};
  Object.entries(fields).forEach(([id,label])=>{const wrap=document.createElement("label");wrap.textContent=label;const input=document.createElement("input");input.name=id;input.required=true;input.readOnly=Boolean(registryEditingId)&&["id","entry"].includes(id);input.className="setting-input";input.type=id==="order"?"number":"text";input.value=registryFormDraft[id]??(id==="order"?"0":"");input.oninput=()=>registryFormDraft[id]=input.value;wrap.append(input);form.append(wrap)});
  const enabledLabel=document.createElement("label");enabledLabel.textContent="官方啟用";const enabled=document.createElement("input");enabled.type="checkbox";enabled.name="enabled";enabled.checked=registryFormDraft.enabled!==false;enabled.onchange=()=>registryFormDraft.enabled=enabled.checked;enabledLabel.append(enabled);form.append(enabledLabel);
  const market=document.createElement("select");market.name="market";market.className="setting-input";market.setAttribute("aria-label","銷售市場");market.add(new Option("一般銷售 App",""));market.add(new Option("內地銷售 App","mainland"));market.value=registryFormDraft.market||"";market.onchange=()=>registryFormDraft.market=market.value;form.append(market);
  const submit=document.createElement("button");submit.className="secondary-button primary";submit.textContent="驗證並註冊（Front 入口）";form.append(submit);const status=document.createElement("p");status.setAttribute("role","status");form.append(status);
  form.onsubmit=async event=>{event.preventDefault();if(workspaceStudioDirty()){status.textContent="請先同步現有首頁草稿，再註冊 App；所有輸入已保留。";return}submit.disabled=true;const data=Object.fromEntries(new FormData(form));try{const entry=new URL(data.entry);entry.searchParams.set("avaEntry","frontend");const app=registryEditingId?{...getModule(registryEditingId),name:data.name,displayNameZh:data.name,category:data.category,order:Number(data.order),enabled:enabled.checked}: {id:data.id,moduleId:data.id,name:data.name,displayNameZh:data.name,entry:data.entry,entryModes:{frontend:entry.href},capabilities:{frontend:true,user:false,admin:false},roleVisibility:{frontend:true,user:false,admin:false},category:data.category,order:Number(data.order),enabled:true,visible:true,allowFavorite:true,icon:"grid",description:"",area:"workspace"};app.enabled=enabled.checked;if(data.market)app.market=data.market;else delete app.market;const result=await AVAHomepageCloud.upsertRegistration(app,officialHomepageDefault);acceptOfficialHomepage(AVAHomepageCloud.reconcile(AVAHomepageCloud.parseResponse({success:true,data:result.data}),BUNDLED_HOMEPAGE_DEFAULT,MODULE_REGISTRY).config);localStorage.setItem(AVAHomepageCloud.CACHE_KEY,JSON.stringify({success:true,data:result.data}));studioDraft=JSON.parse(JSON.stringify(officialHomepageDefault));renderModules();renderStudioDraft();studioStatus.textContent="註冊已獲伺服器儲存及覆讀確認。"}catch(error){status.textContent=`註冊失敗：${error.message}；輸入已保留。`}finally{submit.disabled=false}};root.append(form);
  const categoriesRoot=document.getElementById("studioCategories");categoriesRoot.replaceChildren();const h=document.createElement("h3");h.textContent="官方分類卡（最多 9 張）";categoriesRoot.append(h);
  studioDraft.categories=studioDraft.categories||WORKSPACE_CATEGORIES.map(c=>({...c}));studioDraft.categories.forEach(category=>{const label=document.createElement("label");label.textContent=category.id;const name=document.createElement("input");name.className="setting-input";name.setAttribute("aria-label",`${category.id} 官方名稱`);name.value=category.title;name.oninput=()=>category.title=name.value;const order=document.createElement("input");order.type="number";order.className="setting-input";order.setAttribute("aria-label",`${category.id} 官方排序`);order.value=category.order;order.oninput=()=>category.order=Number(order.value);const activeLabel=document.createElement("label");activeLabel.textContent="啟用分類";const active=document.createElement("input");active.type="checkbox";active.checked=category.enabled!==false;active.onchange=()=>category.enabled=active.checked;activeLabel.append(active);label.append(name,order,activeLabel);categoriesRoot.append(label)});
  const add=workspaceButton("新增官方分類卡",()=>{if(studioDraft.categories.length>=9)return;const id=`area-${studioDraft.categories.length+1}`;studioDraft.categories.push({id,title:"新分類",order:studioDraft.categories.length,enabled:true});renderStudioDraft()});add.disabled=studioDraft.categories.length>=9;categoriesRoot.append(add);
}
window.addEventListener("resize",()=>{if(document.getElementById("favoritesCarousel"))renderFavorites()});
