function Tabzy(selector, options = {}) {
    this.container = document.querySelector(selector);
    if (!this.container) {
        console.error(`Tabzy: No container found for selector`);
        return;
    }
    this.tabs = Array.from(this.container.querySelectorAll("li a"));
    if (!this.tabs.length) {
        console.error("Tabzy: No tabs found inside the container");
        return;
    }

    this.panels = this._getPanel();
    if (this.tabs.length !== this.panels.length) return;

    this.opt = Object.assign(
        { activeClassName: "tabzy--active", remember: false, onChange: null },
        options
    );

    this._cleanRegex = /[^a-zA-Z0-9]/g;
    this.paramKey = selector.replace(this._cleanRegex, "");
    this.originHTML = this.container.innerHTML;

    this._init();
}

Tabzy.prototype._getPanel = function () {
    return this.tabs
        .map((tab) => {
            const panel = document.querySelector(tab.getAttribute(`href`));
            if (!panel) {
                console.error(
                    `Tabzy: No panel found for selector '${tab.getAttribute(
                        "href"
                    )}'`
                );
            }
            return panel;
        })
        .filter(Boolean);
};

Tabzy.prototype._init = function () {
    const params = new URLSearchParams(location.search);
    const tabSelector = params.get(this.paramKey);
    const tab =
        (this.opt.remember &&
            tabSelector &&
            this.tabs.find(
                (tab) =>
                    tab.getAttribute("href").replace(this._cleanRegex, "") ===
                    tabSelector
            )) ||
        this.tabs[0];

    this.currentTab = tab;
    this._activeTab(tab, false, false);

    this.tabs.forEach((tab) => {
        tab.onclick = (e) => {
            e.preventDefault();
            this._tryActivateTab(tab);
        };
    });
};

Tabzy.prototype._tryActivateTab = function (tab) {
    if (this.currentTab !== tab) {
        this.currentTab = tab;
        this._activeTab(tab);
    }
};

Tabzy.prototype._renderTabContent = function () {
    this.panels.forEach((panel) => {
        panel.hidden = true;
    });
};

Tabzy.prototype._activeTab = function (
    tab,
    triggerOnChange = true,
    updateURL = this.opt.remember
) {
    if (!tab) return;
    this._renderTabContent();

    this.tabs.forEach((tab) => {
        tab.closest("li").classList.remove(this.opt.activeClassName);
    });

    tab.closest("li").classList.add(this.opt.activeClassName);

    const panelActive = document.querySelector(tab.getAttribute("href"));
    panelActive.hidden = false;

    if (updateURL) {
        const params = new URLSearchParams(location.search);
        params.set(
            this.paramKey,
            tab.getAttribute("href").replace(this._cleanRegex, "")
        );
        history.replaceState(null, null, `?${params}`);
    }

    if (triggerOnChange && typeof this.opt.onChange === "function") {
        this.opt.onChange({
            tab,
            panel: panelActive,
        });
    }
};

Tabzy.prototype.switch = function (input) {
    let tab =
        typeof input === "string"
            ? this.tabs.find((tab) => tab.getAttribute("href") === input)
            : this.tabs.includes(input)
            ? input
            : null;
    if (!tab) {
        console.error(`Tabzy: Invalid input '${input}`);
        return;
    }
    this._tryActivateTab(tabToActive);
};

Tabzy.prototype.destroy = function () {
    this.container.innerHTML = this.originHTML;
    this.panels.forEach((panel) => (panel.hidden = false));
    this.container = null;
    this.tabs = null;
    this.panels = null;
    this.currentTab = null;
};
