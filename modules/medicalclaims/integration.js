(function (global) {
  "use strict";

  const params = new URLSearchParams(global.location.search);
  const requestedEntry = params.get("avaEntry");
  const validEntries = ["frontend", "user", "admin"];
  const integrated = validEntries.includes(requestedEntry);
  const entry = integrated ? requestedEntry : "standalone";
  const returnTargets = Object.freeze({
    frontend: "../../index.html",
    user: "../../index.html?avaSurface=user",
    admin: "../../index.html?avaSurface=admin"
  });

  document.body.classList.add(entry === "standalone" ? "medical-standalone" : "ava-front", `ava-entry-${entry}`);
  document.body.dataset.avaEntry = entry;

  function returnToAVA() {
    if (integrated) global.location.assign(returnTargets[entry]);
  }

  function createPlatformBackButton() {
    if (!integrated) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ava-module-close";
    button.setAttribute("aria-label", entry === "frontend" ? "返回 AVA Workspace" : "返回 AVA 管理介面");
    button.textContent = "← 返回 AVA";
    button.addEventListener("click", returnToAVA);
    if (entry === "frontend") {
      document.querySelector(".header-version-bar")?.prepend(button);
    } else {
      document.querySelector(".admin-header-nav")?.prepend(button);
    }
  }

  function enterManagementMode() {
    if (entry !== "user" && entry !== "admin") return;
    document.body.classList.remove("ava-front");
    document.body.classList.add("ava-management");
    openAdminModal();
    const title = document.getElementById("adminHeaderTitle");
    if (title && entry === "user") title.textContent = "Medical Claims｜個人設定";
    if (title && entry === "admin" && !isAdminMaster) title.textContent = "Medical Claims｜AVA Studio（請登入管理員）";
    // In AVA management entries, every existing close path returns to the
    // owning platform surface rather than exposing the hidden customer flow.
    global.closeAdminModal = returnToAVA;
  }

  global.AVAMedicalClaimsIntegration = Object.freeze({ entry, integrated, returnToAVA });
  createPlatformBackButton();
  enterManagementMode();

  if (!integrated && "serviceWorker" in navigator) {
    global.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js", { scope: "./" })
        .catch(error => console.warn("[Medical Claims] Service worker registration failed:", error));
    });
  }
})(window);
