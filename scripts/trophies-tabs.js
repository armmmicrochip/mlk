(function () {
    const tabs = document.querySelectorAll("[data-tab-button]");
    const panels = document.querySelectorAll("[data-tab-panel]");
    if (!tabs.length || !panels.length) return;

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.tabButton;
            tabs.forEach((t) => {
                const isActive = t.dataset.tabButton === target;
                t.classList.toggle("trophies__tab_state_active", isActive);
                t.setAttribute("aria-selected", isActive ? "true" : "false");
            });
            panels.forEach((panel) => {
                const isActive = panel.dataset.tabPanel === target;
                panel.classList.toggle("trophies__panel_hidden", !isActive);
            });
        });
    });
})();
