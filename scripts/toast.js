(function () {
    let stack;

    function getStack() {
        if (stack && document.body.contains(stack)) return stack;
        stack = document.querySelector(".toast-stack");
        if (!stack) {
            stack = document.createElement("div");
            stack.className = "toast-stack";
            document.body.appendChild(stack);
        }
        return stack;
    }

    function resolveBody(trigger) {
        const bodyTemplate = trigger.dataset.toastBody || "";
        const emailSelector = trigger.dataset.toastBodyEmail;
        if (emailSelector) {
            const source = document.querySelector(emailSelector);
            const email = source ? (source.textContent || "").trim() : "";
            return bodyTemplate.replace(/\{email\}/g, email);
        }
        return bodyTemplate;
    }

    function removeToast(toast) {
        toast.dataset.state = "closed";
        toast.addEventListener("transitionend", () => {
            if (toast.parentElement) toast.parentElement.removeChild(toast);
        }, { once: true });
    }

    function showToast({ title, body, timeout = 5000 } = {}) {
        const container = getStack();

        const toast = document.createElement("div");
        toast.className = "toast";
        toast.dataset.state = "closed";

        const iconWrap = document.createElement("div");
        iconWrap.className = "toast__icon-wrap";
        iconWrap.innerHTML = '<svg class="toast__icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M36.5557 8.44437C37.4148 9.30352 37.4148 10.6965 36.5557 11.5556L17.5557 30.5556C16.6965 31.4148 15.3036 31.4148 14.4444 30.5556L4.44441 20.5556C3.58526 19.6965 3.58526 18.3035 4.44441 17.4444C5.30357 16.5852 6.69653 16.5852 7.55568 17.4444L16 25.8887L33.4444 8.44437C34.3036 7.58521 35.6965 7.58521 36.5557 8.44437Z" fill="currentColor"/></svg>';

        const content = document.createElement("div");
        content.className = "toast__content";
        if (title) {
            const t = document.createElement("p");
            t.className = "toast__title";
            t.textContent = title;
            content.appendChild(t);
        }
        if (body) {
            const b = document.createElement("p");
            b.className = "toast__body";
            b.textContent = body;
            content.appendChild(b);
        }

        const close = document.createElement("button");
        close.type = "button";
        close.className = "toast__close generic-button-reset";
        close.setAttribute("aria-label", "Dismiss notification");
        const closeIcon = document.createElement("img");
        closeIcon.className = "toast__close-icon";
        closeIcon.src = "images/close-icon.svg";
        closeIcon.alt = "";
        close.appendChild(closeIcon);
        close.addEventListener("click", () => removeToast(toast));

        toast.appendChild(iconWrap);
        toast.appendChild(content);
        toast.appendChild(close);
        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.dataset.state = "open";
        });

        if (timeout > 0) {
            setTimeout(() => removeToast(toast), timeout);
        }

        return toast;
    }

    window.showToast = showToast;

    document.addEventListener("click", (event) => {
        const trigger = event.target.closest("[data-toast-title]");
        if (!trigger) return;
        showToast({
            title: trigger.dataset.toastTitle,
            body: resolveBody(trigger),
            timeout: Number(trigger.dataset.toastTimeout) || 5000,
        });
    });
})();
