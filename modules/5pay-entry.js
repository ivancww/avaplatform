(function bootstrap5PayEntry(global){
  "use strict";
  const mode=global.__AVA_5PAY_ENTRY_MODE;
  console.info(`[5Pay] Entry mode received: ${mode}`);
  if(mode!=="user"&&mode!=="admin")return;

  const labels={control:["控制台","Control Panel","Dashboard"],user:["使用者","User"],admin:["管理者","Admin"]};
  const clickableSelector="button, a, [role=button], input[type=button], input[type=submit]";
  const textOf=element=>(element.value||element.textContent||"").replace(/\s+/g," ").trim();
  const visible=element=>!!(element.offsetWidth||element.offsetHeight||element.getClientRects().length);
  function findControl(words){
    return [...document.querySelectorAll(clickableSelector)].find(element=>visible(element)&&words.some(word=>textOf(element)===word||textOf(element).includes(word)));
  }
  function enterDashboard(){
    const roleControl=findControl(labels[mode]);
    if(roleControl){roleControl.click();console.info(`[5Pay] Opened original ${mode} dashboard`);return true}
    const dashboardControl=findControl(labels.control);
    if(dashboardControl&&!dashboardControl.dataset.avaEntryClicked){dashboardControl.dataset.avaEntryClicked="true";dashboardControl.click()}
    return false;
  }
  if(enterDashboard())return;
  const observer=new MutationObserver(()=>{if(enterDashboard())observer.disconnect()});
  observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden","class","style"]});
  global.addEventListener("load",enterDashboard,{once:true});
})(window);
