function Tabzy(
  selector,
  { defaultActiveTabIndex = 0, activeClass = "activeClass" }
) {
  this.container = document.querySelector(selector);
  if (!this.container) {
    console.error(`Tabzy: No container found for selector '${selector}'`);
    return;
  }

  const tabs = Array.from(this.container.children);
  if (!tabs.length) {
    console.error("Tabzy: No tabs found inside the container");
    return;
  }
  if (tabs.length < defaultActiveTabIndex) {
    console.error("Tabzy: Index over limit tabs length ");
    return;
  }
  this.tabsContent = [];

  tabs.forEach((tab) => {
    if (!tab.children.length || !tab.children[0].hash) {
      console.error("Tabzy: Tab does not contain a valid anchor element");
      return;
    }
    let id = tab.children[0].hash.slice(1);
    let content = document.getElementById(id);

    if (!content) {
      console.error(
        `Tabzy: No panel found for selector '${tab.children[0].hash}'`
      );
      return;
    }
    this.tabsContent.push(content);
  });

  if (tabs.length !== this.tabsContent.length) return;

  this.activeTab = this.container.children[defaultActiveTabIndex];
  this.activeClass = activeClass;
  this.activeTab.classList.add(this.activeClass);

  this.activeId = this.activeTab.children[0].hash.slice(1);

  this.container.addEventListener("click", (e) => {
    const currentTab = e.target.parentElement;
    if (currentTab === this.activeTab) return;

    this._setActiveTab(currentTab);
  });

  this._renderTabContent();
}

Tabzy.prototype._setActiveTab = function (currentTab) {
  if (!currentTab) return;
  this.activeTab.classList.remove(this.activeClass);
  this.activeTab = currentTab;
  this.activeTab.classList.add(this.activeClass);
  this.activeId = this.activeTab.children[0].hash.slice(1);
  this._renderTabContent();
  if (typeof this.onChange === "function") {
    this.onChange(this.activeId);
  }
};

Tabzy.prototype._renderTabContent = function () {
  this.tabsContent.forEach((tabContent, index) => {
    if (tabContent) tabContent.setAttribute("hidden", "");
    if (this.activeId === tabContent.id) {
      this.tabsContent[index].removeAttribute("hidden");
    }
  });
};

Tabzy.prototype.toggle = function (href) {
  const a = document.querySelector(`[href="${href}"]`);
  if (!a) {
    console.error(`Tabzy: No tab found for href '${href}'`);
    return;
  }
  const currentTab = a.closest("li");
  if (!currentTab) return;
  this.activeId = href.slice(1);
  this._setActiveTab(currentTab);
};

Tabzy.prototype.destroy = function () {
  if (this.activeClass) {
    this.activeTab.classList.remove(this.activeClass);
  }
  this.activeId = null;
  this.tabsContent.forEach((tabContent, index) => {
    if (tabContent) {
      tabContent.removeAttribute("hidden");
    }
  });
};
