(function () {
    const openModals = new Set();

    function openModal(modal) {
        if (!modal) return;
        prefillModal(modal);
        modal.dataset.state = "open";
        document.body.classList.add("side-modal-open");
        openModals.add(modal);
        syncSubmitGate(modal);

        const firstField = modal.querySelector(
            "input:not([type='hidden']), select, textarea, .form-field__trigger, .side-modal__list-button, button:not([data-modal-close])"
        );
        if (firstField) firstField.focus({ preventScroll: true });
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.dataset.state = "closed";
        openModals.delete(modal);
        if (openModals.size === 0) {
            document.body.classList.remove("side-modal-open");
        }
        clearForm(modal);
    }

    function clearForm(modal) {
        const form = modal.querySelector("form");
        if (!form) return;
        form.reset();
        form.querySelectorAll("[data-state='error']").forEach((field) => {
            field.removeAttribute("data-state");
        });
        form.querySelectorAll(".form-select").forEach(syncSelectEmpty);
        form.querySelectorAll(".form-field__trigger").forEach(resetTrigger);
        form.querySelectorAll("[data-select-for]").forEach((hidden) => {
            hidden.value = "";
        });
        form.querySelectorAll("input[type='text'][data-was-password]").forEach((input) => {
            input.type = "password";
            input.removeAttribute("data-was-password");
            const btn = input.parentElement?.querySelector("[data-password-toggle]");
            if (btn) {
                const icon = btn.querySelector(".form-field__action-icon");
                if (icon) icon.src = "images/eye-closed.svg";
                btn.setAttribute("aria-label", "Show password");
            }
        });
        syncSubmitGate(modal);
    }

    function resetTrigger(trigger) {
        trigger.dataset.empty = "true";
        trigger.removeAttribute("data-value");
        const valueEl = trigger.querySelector(".form-field__value");
        if (valueEl) valueEl.textContent = "";
    }

    function syncSelectEmpty(select) {
        select.dataset.empty = select.value === "" ? "true" : "false";
    }

    function getFieldControl(field) {
        const trigger = field.querySelector(".form-field__trigger");
        if (trigger) {
            return { el: trigger, isEmpty: trigger.dataset.empty === "true", value: trigger.dataset.value || "" };
        }
        const control = field.querySelector("input:not([type='hidden']), select, textarea");
        if (control) {
            const value = (control.value || "").trim();
            return { el: control, isEmpty: value === "", value };
        }
        const hidden = field.querySelector("input[type='hidden']");
        if (hidden) {
            const value = (hidden.value || "").trim();
            return { el: hidden, isEmpty: value === "", value };
        }
        return null;
    }

    function validateForm(form) {
        let firstInvalid = null;
        form.querySelectorAll("[data-validate]").forEach((field) => {
            const found = getFieldControl(field);
            if (!found) return;
            if (found.isEmpty) {
                field.dataset.state = "error";
                setFieldError(field, field.dataset.fieldErrorRequired || defaultErrorText(field));
                if (!firstInvalid) firstInvalid = found.el;
                return;
            }
            field.removeAttribute("data-state");

            const matchId = field.dataset.matchWith;
            if (matchId) {
                const other = document.getElementById(matchId);
                if (other && other.value !== found.value) {
                    field.dataset.state = "error";
                    setFieldError(field, field.dataset.fieldErrorMismatch || "Values don't match");
                    if (!firstInvalid) firstInvalid = found.el;
                }
            }
        });
        if (firstInvalid && typeof firstInvalid.focus === "function") {
            firstInvalid.focus();
        }
        return !firstInvalid;
    }

    function defaultErrorText(field) {
        const el = field.querySelector(".form-field__error");
        return el ? el.dataset.defaultText || el.textContent : "";
    }

    function setFieldError(field, text) {
        const el = field.querySelector(".form-field__error");
        if (!el) return;
        if (!el.dataset.defaultText) el.dataset.defaultText = el.textContent;
        if (text) el.textContent = text;
    }

    function applyOption(option) {
        const triggerId = option.dataset.optionFor;
        const trigger = document.getElementById(triggerId);
        if (!trigger) return;

        const value = option.dataset.value || "";
        const label = option.dataset.label || option.textContent.trim();

        trigger.dataset.empty = value === "" ? "true" : "false";
        trigger.dataset.value = value;
        const valueEl = trigger.querySelector(".form-field__value");
        if (valueEl) valueEl.textContent = label;

        const hidden = document.querySelector(`[data-select-for="${triggerId}"]`);
        if (hidden) hidden.value = value;

        const field = trigger.closest(".form-field");
        if (field) field.removeAttribute("data-state");

        const modal = option.closest(".side-modal");
        closeModal(modal);
    }

    function prefillModal(modal) {
        modal.querySelectorAll("[data-prefill-target]").forEach((input) => {
            const fromSelector = input.dataset.prefillTarget;
            const source = fromSelector ? document.querySelector(fromSelector) : null;
            if (!source) return;
            const value = (source.textContent || "").trim();
            input.value = value;
        });
    }

    function syncSubmitGate(modal) {
        if (!modal) return;
        const form = modal.querySelector("form[data-submit-gate]");
        if (!form) return;
        const submit = form.querySelector("[type='submit']");
        if (!submit) return;
        let allFilled = true;
        form.querySelectorAll("[data-validate]").forEach((field) => {
            const found = getFieldControl(field);
            if (!found || found.isEmpty) allFilled = false;
        });
        submit.disabled = !allFilled;
    }

    function togglePassword(button) {
        const field = button.closest(".form-field__control");
        if (!field) return;
        const input = field.querySelector(".form-input");
        if (!input) return;
        const icon = button.querySelector(".form-field__action-icon");
        if (input.type === "password") {
            input.type = "text";
            input.dataset.wasPassword = "true";
            if (icon) icon.src = "images/eye.svg";
            button.setAttribute("aria-label", "Hide password");
        } else {
            input.type = "password";
            input.removeAttribute("data-was-password");
            if (icon) icon.src = "images/eye-closed.svg";
            button.setAttribute("aria-label", "Show password");
        }
    }

    document.addEventListener("click", (event) => {
        const pwToggle = event.target.closest("[data-password-toggle]");
        if (pwToggle) {
            event.preventDefault();
            togglePassword(pwToggle);
            return;
        }

        const option = event.target.closest("[data-option-for]");
        if (option) {
            applyOption(option);
            return;
        }

        const trigger = event.target.closest("[data-modal-target]");
        if (trigger) {
            const modal = document.getElementById(trigger.dataset.modalTarget);
            openModal(modal);
            return;
        }

        const closeTrigger = event.target.closest("[data-modal-close]");
        if (closeTrigger) {
            const modal = closeTrigger.closest(".side-modal");
            closeModal(modal);
            return;
        }

        const overlay = event.target.closest(".side-modal__overlay");
        if (overlay) {
            const modal = overlay.closest(".side-modal");
            closeModal(modal);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || openModals.size === 0) return;
        const last = [...openModals].pop();
        closeModal(last);
    });

    document.addEventListener("submit", (event) => {
        const form = event.target;
        if (!form.matches(".side-modal form")) return;
        event.preventDefault();
        if (!validateForm(form)) return;
        const modal = form.closest(".side-modal");
        closeModal(modal);
    });

    document.addEventListener("input", (event) => {
        const control = event.target;
        const field = control.closest(".form-field");
        if (field) {
            if (field.dataset.state === "error" && (control.value || "").trim() !== "") {
                field.removeAttribute("data-state");
            }
            if (control.matches(".form-select")) {
                syncSelectEmpty(control);
            }
        }
        const modal = control.closest(".side-modal");
        if (modal) syncSubmitGate(modal);
    });

    document.addEventListener("change", (event) => {
        if (event.target.matches(".form-select")) {
            syncSelectEmpty(event.target);
        }
    });

    document.querySelectorAll(".form-select").forEach(syncSelectEmpty);
})();
