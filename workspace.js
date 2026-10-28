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
    if(module.allowFavorite){const inFavorites=favoriteIds().includes(module.id);const shortcut=workspaceButton(inFavorites?"移除常用捷徑":"移到常用 App",()=>setFavorite(module.id,!inFavorites));controls.append(shortcut);}
    if(!favorite&&presentation){controls.append(cardMoveSelect("official",module.id,homepagePreference.officialOverrides[module.id]?.areaId||presentation.areaId||"area-1"),cardOrderSelect("official",module.id,homepagePreference.officialOverrides[module.id]?.areaId||presentation.areaId||"area-1"),workspaceButton("從首頁隱藏",()=>hideOfficialModule(module.id)));}
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
function renderLegacyWorkspace(){
  renderFavorites();
  for(const selectId of ["officialCardArea","availableAppArea"]){const select=document.getElementById(selectId);if(!select)continue;const previous=select.value;select.replaceChildren(...workspaceCategories().map(c=>new Option(homepagePreference.areaOverrides[c.id]||c.title,c.id)));if([...select.options].some(o=>o.value===previous))select.value=previous;}
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
    state.cards.filter(item=>item.kind==="official"&&(homepagePreference.officialOverrides[item.id]?.areaId||item.areaId)===category.id).forEach(item=>{
      if(getModule(item.moduleKey||item.id))grid.append(workspaceAppCard(getModule(item.moduleKey||item.id)));
      else grid.append(workspaceContentCard(item));
    });
    section.append(grid);root.append(section);
  });
  const library=document.getElementById("toolLibraryModules");library.replaceChildren(...visible.map(module=>workspaceAppCard(module)));
  // The legacy flow list remains available through its existing directory route.
}
// Sheet default_area is authoritative for official placement. Metadata appIds
// describes the same assignment and discrepancies are reported by the parser.
let folderPage=0,activeWorkspaceFolder="",folderReturnFocus=null,folderPreviousOverflow="";
function folderSvg(icon){
  const symbols={wallet:'<rect x="26" y="27" width="18" height="12" rx="2"/><path d="M35 32h5"/>',"shield-check":'<path d="M35 22l9 3v7c0 6-4 9-9 11-5-2-9-5-9-11v-7z"/><path d="m30 32 3 3 6-6"/>',"chart-no-axes-combined":'<path d="m26 39 6-7 5 3 7-10"/><path d="M39 25h5v5"/>',"chart-column":'<path d="M26 40V28m6 12V23m6 17V31m6 9V26"/>',workflow:'<circle cx="27" cy="27" r="3"/><circle cx="43" cy="27" r="3"/><circle cx="35" cy="40" r="3"/><path d="M30 27h10m-12 3 5 7m9-7-5 7"/>'};
  return `<svg class="folder-icon" viewBox="0 0 64 54" aria-hidden="true"><path d="M5 13a4 4 0 0 1 4-4h14l5 5h27a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" fill="var(--ava-color-brand-soft)" stroke="currentColor" stroke-width="2"/><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${symbols[icon]||symbols.wallet}</g></svg>`;
}
function folderModules(id){
  const enabled=new Set(workspaceCategories().filter(c=>c.enabled!==false).map(c=>c.id));
  return registeredModulesForSurface("frontend").filter(app=>{
    const official=officialHomepageDefault.items.find(card=>card.moduleKey===app.id||card.id===app.id);
    const override=homepagePreference.officialOverrides[app.id]?.areaId;
    return (enabled.has(override)?override:official?.areaId)===id;
  }).sort((a,b)=>{
    const rank=app=>homepagePreference.officialOverrides[app.id]?.order??officialHomepageDefault.items.find(card=>card.moduleKey===app.id||card.id===app.id)?.order??app.order??0;
    return rank(a)-rank(b)||a.id.localeCompare(b.id);
  });
}
function resetWorkspacePlacement(){
  for(const value of Object.values(homepagePreference.officialOverrides)){delete value.areaId;delete value.folderId;}
  saveHomepagePreference();renderModules();showToast("已恢復官方分類；常用 App 及顯示名稱保持不變。");
}
function moveFolderApp(app,id){
  if(!workspaceCategories().some(c=>c.id===id&&c.enabled!==false))return;
  homepagePreference=AVAHomepage.updateCardPosition(homepagePreference,"official",app.id,id,folderModules(id).length);
  saveHomepagePreference();renderModules();document.querySelector("#workspaceFolderModal .close-button")?.focus({preventScroll:true});
  const status=document.getElementById("workspaceFolderStatus");status.textContent=`已移至 ${homepagePreference.areaOverrides[id]||workspaceCategories().find(c=>c.id===id).title}。`;
}
function reorderFolderApp(id,folderId,target){
  const apps=folderModules(folderId),from=apps.findIndex(app=>app.id===id);if(from<0)return;
  const [app]=apps.splice(from,1);apps.splice(Math.max(0,Math.min(target,apps.length)),0,app);
  apps.forEach((item,index)=>{homepagePreference.officialOverrides[item.id]={...(homepagePreference.officialOverrides[item.id]||{}),order:index};});
  saveHomepagePreference();renderModules();document.querySelector(`#workspaceFolderApps [data-module-id="${CSS.escape(id)}"] select[aria-label="資料夾內次序"]`)?.focus({preventScroll:true});
  document.getElementById("workspaceFolderStatus").textContent="App 次序已更新。";
}
function orderedWorkspaceFolders(){const order=workspaceCategoryOrder();return workspaceCategories().filter(c=>c.enabled!==false).slice().sort((a,b)=>{const ai=order.indexOf(a.id),bi=order.indexOf(b.id);return (ai<0?1000+a.order:ai)-(bi<0?1000+b.order:bi)||a.id.localeCompare(b.id)});}
function closeWorkspaceFolder(){const modal=document.getElementById("workspaceFolderModal");if(!modal.classList.contains("open"))return;modal.classList.remove("open");document.querySelector(".app").inert=false;document.body.style.overflow=folderPreviousOverflow;activeWorkspaceFolder="";if(folderReturnFocus?.isConnected)folderReturnFocus.focus();else document.querySelector(".folder-open")?.focus();}
function showWorkspaceFolder(id,trigger){activeWorkspaceFolder=id;folderReturnFocus=trigger;folderPreviousOverflow=document.body.style.overflow;document.body.style.overflow="hidden";document.querySelector(".app").inert=true;const modal=document.getElementById("workspaceFolderModal");modal.classList.add("open");renderWorkspaceFolder();modal.querySelector(".close-button").focus();}
function renderWorkspaceFolder(){
  const category=workspaceCategories().find(c=>c.id===activeWorkspaceFolder),metadata=officialHomepageDefault.folderMetadata?.find(x=>x.id===activeWorkspaceFolder);if(!category){closeWorkspaceFolder();return}
  document.getElementById("workspaceFolderTitle").textContent=homepagePreference.areaOverrides[category.id]||category.title;document.getElementById("workspaceFolderDescription").textContent=metadata?.description||"";document.getElementById("workspaceFolderIcon").innerHTML=folderSvg(metadata?.icon);
  const root=document.getElementById("workspaceFolderApps"),apps=folderModules(category.id),shell=document.querySelector(".folder-modal-shell"),scroll=shell.scrollTop,focused=root.contains(document.activeElement)?document.activeElement:null,focusApp=focused?.closest("[data-module-id]")?.dataset.moduleId,focusLabel=focused?.getAttribute("aria-label"),focusText=focused?.textContent;root.replaceChildren();
  apps.forEach((app,index)=>{const card=workspaceAppCard(app);if(editMode){const controls=card.querySelector(".workspace-card-controls"),selects=controls?.querySelectorAll("select");if(selects?.length){
    const placement=selects[0];placement.replaceChildren(...workspaceCategories().filter(c=>c.enabled!==false).map(c=>new Option(homepagePreference.areaOverrides[c.id]||c.title,c.id,false,c.id===category.id)));placement.setAttribute("aria-label","移動至其他資料夾");placement.onchange=()=>moveFolderApp(app,placement.value);
    const order=selects[1];order.replaceChildren(...apps.map((_,i)=>new Option(`位置 ${i+1}`,String(i),false,i===index)));order.setAttribute("aria-label","資料夾內次序");order.onchange=()=>reorderFolderApp(app.id,category.id,Number(order.value));
    }
    card.addEventListener("click",event=>{if(event.target.closest("button")?.textContent==="改顯示名稱")closeWorkspaceFolder()},{capture:true});
    }root.append(card)});shell.scrollTop=scroll;if(focusApp){const card=[...root.querySelectorAll("[data-module-id]")].find(el=>el.dataset.moduleId===focusApp);const control=[...(card?.querySelectorAll("button,select")||[])].find(el=>focusLabel?el.getAttribute("aria-label")===focusLabel:el.textContent===focusText);(control||document.querySelector("#workspaceFolderModal .close-button"))?.focus({preventScroll:true});}
  if(!apps.length){const empty=document.createElement("p");empty.className="folder-empty";empty.textContent="此資料夾暫時沒有 App。";root.append(empty)}
}
function renderFolderWorkspace(){
  renderFavorites();for(const selectId of ["officialCardArea","availableAppArea"]){const select=document.getElementById(selectId);if(!select)continue;const previous=select.value;select.replaceChildren(...workspaceCategories().map(c=>new Option(homepagePreference.areaOverrides[c.id]||c.title,c.id)));if([...select.options].some(o=>o.value===previous))select.value=previous;}
  const root=document.getElementById("homeSections"),ordered=orderedWorkspaceFolders(),pageSize=officialHomepageDefault.folderLayout?.pageSize||9,pages=Math.ceil(ordered.length/pageSize);folderPage=Math.max(0,Math.min(folderPage,pages-1));root.classList.add("folder-carousel");root.replaceChildren();root.setAttribute("role","region");root.setAttribute("aria-label","銷售工作空間資料夾");root.tabIndex=0;
  ordered.slice(folderPage*pageSize,folderPage*pageSize+pageSize).forEach(category=>{const metadata=officialHomepageDefault.folderMetadata.find(f=>f.id===category.id),tile=document.createElement("article");tile.className="folder-tile";tile.dataset.folderId=category.id;const button=document.createElement("button");button.className="folder-open";button.type="button";button.innerHTML=folderSvg(metadata?.icon);const title=document.createElement("h3");title.textContent=homepagePreference.areaOverrides[category.id]||category.title;const description=document.createElement("p");description.textContent=metadata?.description||"";const count=document.createElement("div");count.className="folder-meta";const label=document.createElement("span");label.textContent=`${folderModules(category.id).length} 個 App`;const arrow=document.createElement("span");arrow.textContent="→";arrow.setAttribute("aria-hidden","true");count.append(label,arrow);button.append(title,description,count);button.onclick=()=>showWorkspaceFolder(category.id,button);tile.append(button);
    if(editMode){const actions=document.createElement("div");actions.className="workspace-card-controls";actions.append(workspaceButton("改顯示名稱",()=>openAreaEditor(category.id)));const select=document.createElement("select");select.className="move-select";select.setAttribute("aria-label",`${category.title} 排序`);ordered.forEach((c,i)=>select.add(new Option(`位置 ${i+1}`,String(i),false,c.id===category.id)));select.onchange=()=>{const ids=ordered.map(c=>c.id).filter(id=>id!==category.id);ids.splice(Number(select.value),0,category.id);const visible=new Set(ordered.map(c=>c.id)),previous=workspaceCategoryOrder();let index=0;const saved=previous.map(id=>visible.has(id)?ids[index++]:id);while(index<ids.length)saved.push(ids[index++]);localStorage.setItem(STORAGE.homepageOrder,JSON.stringify(saved));renderModules()};actions.append(select);tile.append(actions)}root.append(tile)});
  const change=page=>{folderPage=Math.max(0,Math.min(page,pages-1));renderFolderWorkspace();root.focus({preventScroll:true})};root.onkeydown=event=>{if(event.target!==root)return;const actions={ArrowRight:folderPage+1,ArrowLeft:folderPage-1,Home:0,End:pages-1};if(event.key in actions){event.preventDefault();change(actions[event.key])}};let touch=null;root.ontouchstart=event=>{const t=event.changedTouches[0];touch={x:t.clientX,y:t.clientY}};root.ontouchend=event=>{if(!touch)return;const t=event.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y;touch=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))change(folderPage+(dx<0?1:-1))};
  document.getElementById("folderPaging")?.remove();const paging=document.createElement("div");paging.id="folderPaging";paging.className="carousel-controls";if(pages>1){const previous=workspaceButton("←",()=>change(folderPage-1)),next=workspaceButton("→",()=>change(folderPage+1));previous.setAttribute("aria-label","上一組資料夾");next.setAttribute("aria-label","下一組資料夾");previous.disabled=folderPage===0;next.disabled=folderPage===pages-1;paging.append(previous);for(let i=0;i<pages;i++){const dot=workspaceButton("●",()=>change(i),"carousel-dot");dot.setAttribute("aria-label",`資料夾第 ${i+1} 組`);if(i===folderPage)dot.setAttribute("aria-current","true");paging.append(dot)}paging.append(next)}root.after(paging);
  document.getElementById("workspaceDirectory")?.remove();const directory=document.createElement("div");directory.id="workspaceDirectory";directory.className="workspace-directory";directory.append(workspaceButton("所有銷售 App",openToolLibrary));paging.after(directory);
  document.getElementById("toolLibraryModules").replaceChildren(...registeredModulesForSurface("frontend").map(module=>workspaceAppCard(module)));if(activeWorkspaceFolder)renderWorkspaceFolder();
}
function renderWorkspace(){if(officialHomepageDefault.folderMetadata){renderFolderWorkspace();return}document.getElementById("homeSections").classList.remove("folder-carousel");document.getElementById("folderPaging")?.remove();document.getElementById("workspaceDirectory")?.remove();renderLegacyWorkspace()}
const folderDialog=typeof document==="undefined"?null:document.getElementById("workspaceFolderModal");if(folderDialog){folderDialog.addEventListener("click",event=>{if(event.target===folderDialog)closeWorkspaceFolder()});folderDialog.addEventListener("keydown",event=>{if(event.key==="Escape"){event.preventDefault();closeWorkspaceFolder();return}if(event.key!=="Tab")return;const controls=[...folderDialog.querySelectorAll('button:not([disabled]),select:not([disabled]),[tabindex="0"]')].filter(el=>el.offsetParent!==null);if(!controls.length)return;const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}})}
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
  const categoriesRoot=document.getElementById("studioCategories");categoriesRoot.replaceChildren();const h=document.createElement("h3");h.textContent="官方分類卡（每頁最多 9 張）";categoriesRoot.append(h);
  studioDraft.categories=studioDraft.categories||WORKSPACE_CATEGORIES.map(c=>({...c}));studioDraft.categories.forEach(category=>{const label=document.createElement("label");label.textContent=category.id;const name=document.createElement("input");name.className="setting-input";name.setAttribute("aria-label",`${category.id} 官方名稱`);name.value=category.title;name.oninput=()=>category.title=name.value;const order=document.createElement("input");order.type="number";order.className="setting-input";order.setAttribute("aria-label",`${category.id} 官方排序`);order.value=category.order;order.oninput=()=>category.order=Number(order.value);const activeLabel=document.createElement("label");activeLabel.textContent="啟用分類";const active=document.createElement("input");active.type="checkbox";active.checked=category.enabled!==false;active.onchange=()=>category.enabled=active.checked;activeLabel.append(active);label.append(name,order,activeLabel);categoriesRoot.append(label)});
  const add=workspaceButton("新增官方分類卡",()=>{if(studioDraft.categories.length>=99)return;const id=Array.from({length:99},(_,i)=>`area-${i+1}`).find(value=>!studioDraft.categories.some(category=>category.id===value));if(!id)return;studioDraft.categories.push({id,title:"新分類",order:studioDraft.categories.length,enabled:true});renderStudioDraft()});add.disabled=studioDraft.categories.length>=99;categoriesRoot.append(add);
}
window.addEventListener("resize",()=>{if(document.getElementById("favoritesCarousel"))renderFavorites()});
