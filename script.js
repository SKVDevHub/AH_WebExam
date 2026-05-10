/* ============================================================
   AFFINITY HEALTH — QUOTE CALCULATOR
   script.js — All logic, validation, and interactions
   ============================================================ */

'use strict';

/* ---------- DATA: PLANS ---------- */
const PLANS = [
    { value: 'day-to-day', label: 'Day-to-Day Plan', basePrice: 450, url: 'https://www.affinityhealth.co.za/day-to-day-cover/' },
    { value: 'hospital', label: 'Hospital Plan', basePrice: 680, url: 'https://www.affinityhealth.co.za/affordable-hospital-plan-and-quotes-in-south-africa/' },
    { value: 'combined', label: 'Combined Plan', basePrice: 990, url: 'https://www.affinityhealth.co.za/combined-plan/' },
    { value: 'junior', label: 'Junior Cover', basePrice: 320, url: 'https://www.affinityhealth.co.za/junior-cover/' },
    { value: 'senior', label: 'Senior Cover', basePrice: 820, url: 'https://www.affinityhealth.co.za/senior-cover/' },
    { value: 'innovator', label: 'Innovator Range', basePrice: 1250, url: 'https://www.affinityhealth.co.za/innovator-range/' },
];

/* ---------- DATA: PROVINCES ---------- */
const PROVINCES = [
    { value: 'gp', label: 'Gauteng', factor: 1.05 },
    { value: 'wc', label: 'Western Cape', factor: 1.04 },
    { value: 'kzn', label: 'KwaZulu-Natal', factor: 1.02 },
    { value: 'ec', label: 'Eastern Cape', factor: 1.00 },
    { value: 'lp', label: 'Limpopo', factor: 0.98 },
    { value: 'mp', label: 'Mpumalanga', factor: 0.99 },
    { value: 'nw', label: 'North West', factor: 0.98 },
    { value: 'nc', label: 'Northern Cape', factor: 0.97 },
    { value: 'fs', label: 'Free State', factor: 0.99 },
];

/* ---------- PREMIUM CALCULATION ---------- */
function calculatePremium(planValue, age, dependents, provinceValue) {
    const plan = PLANS.find(p => p.value === planValue);
    const province = PROVINCES.find(p => p.value === provinceValue);

    if (!plan || !province || isNaN(age) || isNaN(dependents)) return null;

    const ageFactor = 1 + (age - 18) * 0.008;   // Progressive age loading
    const dependentCost = dependents * 220;            // R220 per dependant
    const base = plan.basePrice * ageFactor;
    const total = (base + dependentCost) * province.factor;

    return Math.round(total);
}

/* ---------- DOM CACHE ---------- */
const dom = {
    planSelect: document.getElementById('plan'),
    ageSlider: document.getElementById('age'),
    ageDisplay: document.getElementById('age-display'),
    dependentsInput: document.getElementById('dependents'),
    depDecrease: document.getElementById('dep-decrease'),
    depIncrease: document.getElementById('dep-increase'),
    provinceSelect: document.getElementById('province'),
    estimateValue: document.getElementById('estimate-value'),
    estimateAmount: document.getElementById('estimate-amount'),
    estimateStrip: document.getElementById('estimate-strip'),
    quoteForm: document.getElementById('quoteForm'),
    getQuoteBtn: document.getElementById('get-quote-btn'),

    // Modal
    modalBackdrop: document.getElementById('modal-backdrop'),
    modalClose: document.getElementById('modal-close'),
    modalEstimate: document.getElementById('modal-estimate'),
    callbackForm: document.getElementById('callbackForm'),
    cbName: document.getElementById('cb-name'),
    cbPhone: document.getElementById('cb-phone'),
    cbTime: document.getElementById('cb-time'),
    modalSuccess: document.getElementById('modal-success'),
    successClose: document.getElementById('success-close'),
    submitCallback: document.getElementById('submit-callback'),

    // Hamburger
    hamburger: document.getElementById('hamburger'),
    mobileMenu: document.getElementById('mobile-menu'),
    mobileClose: document.getElementById('mobile-close'),

    themeToggle: document.getElementById('theme-toggle'),
};

/* ---------- INIT: POPULATE SELECTS ---------- */
function populatePlans() {
    PLANS.forEach((plan, i) => {
        const opt = document.createElement('option');
        opt.value = plan.value;
        opt.textContent = plan.label;
        if (i === 0) opt.selected = true;
        dom.planSelect.appendChild(opt);
    });
}

function populateProvinces() {
    PROVINCES.forEach((prov, i) => {
        const opt = document.createElement('option');
        opt.value = prov.value;
        opt.textContent = prov.label;
        if (i === 0) opt.selected = true;
        dom.provinceSelect.appendChild(opt);
    });
}

/* ---------- ESTIMATE: LIVE UPDATE ---------- */
let estimateAnimFrame = null;

function updateEstimate() {
    const plan = dom.planSelect.value;
    const age = parseInt(dom.ageSlider.value, 10);
    const deps = parseInt(dom.dependentsInput.value, 10);
    const province = dom.provinceSelect.value;

    const total = calculatePremium(plan, age, deps, province);

    if (total === null) {
        dom.estimateValue.textContent = '–';
        return;
    }

    // Animated count-up
    if (estimateAnimFrame) cancelAnimationFrame(estimateAnimFrame);
    const start = parseInt(dom.estimateValue.textContent.replace(/\D/g, ''), 10) || total;
    const end = total;
    const duration = 400;
    const startTime = performance.now();

    function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out-quart
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(start + (end - start) * eased);
        dom.estimateValue.textContent = current.toLocaleString('en-ZA');
        dom.ageSlider.setAttribute('aria-valuenow', dom.ageSlider.value);
        dom.ageSlider.setAttribute('aria-valuetext', `${dom.ageSlider.value} years old`);
        if (progress < 1) estimateAnimFrame = requestAnimationFrame(tick);
    }

    estimateAnimFrame = requestAnimationFrame(tick);
}

/* ---------- SLIDER: AGE ---------- */
function updateSliderFill(slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const val = parseFloat(slider.value);
    const pct = ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--fill', `${pct}%`);
}

function bindAge() {
    dom.ageSlider.addEventListener('input', () => {
        dom.ageDisplay.textContent = dom.ageSlider.value;
        updateSliderFill(dom.ageSlider);
        clearFieldError('age');
        updateEstimate();
    });
    // Init
    updateSliderFill(dom.ageSlider);
}

/* ---------- STEPPER: DEPENDANTS ---------- */
function clampDependents() {
    let val = parseInt(dom.dependentsInput.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    if (val > 10) val = 10;
    dom.dependentsInput.value = val;
    dom.depDecrease.disabled = val <= 0;
    dom.depIncrease.disabled = val >= 10;
}

function bindStepper() {
    dom.depDecrease.addEventListener('click', () => {
        let val = parseInt(dom.dependentsInput.value, 10) || 0;
        if (val > 0) {
            dom.dependentsInput.value = val - 1;
            clampDependents();
            clearFieldError('dependents');
            updateEstimate();
        }
    });

    dom.depIncrease.addEventListener('click', () => {
        let val = parseInt(dom.dependentsInput.value, 10) || 0;
        if (val < 10) {
            dom.dependentsInput.value = val + 1;
            clampDependents();
            clearFieldError('dependents');
            updateEstimate();
        }
    });

    dom.dependentsInput.addEventListener('input', () => {
        clampDependents();
        clearFieldError('dependents');
        updateEstimate();
    });

    // Keyboard support on stepper buttons
    dom.depDecrease.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); dom.depDecrease.click(); }
    });
    dom.depIncrease.addEventListener('keydown', e => {
        if (e.key === 'ArrowUp') { e.preventDefault(); dom.depIncrease.click(); }
    });

    clampDependents();
}

/* ---------- VALIDATION ---------- */
function showFieldError(fieldId, message) {
    const errEl = document.getElementById(`${fieldId}-error`);
    const group = document.getElementById(`group-${fieldId}`);
    const input = group?.querySelector('input, select');
    if (input) input.setAttribute('aria-invalid', 'true');
    if (errEl) { errEl.textContent = message; errEl.hidden = false; }
    if (group) group.classList.add('field-invalid');
}

function clearFieldError(fieldId) {
    const errEl = document.getElementById(`${fieldId}-error`);
    const group = document.getElementById(`group-${fieldId}`);
    const input = group?.querySelector('input, select');
    if (input) input.setAttribute('aria-invalid', 'false');
    if (errEl) { errEl.textContent = ''; errEl.hidden = true; }
    if (group) group.classList.remove('field-invalid');
}

function validateQuoteForm() {
    let valid = true;

    // Plan
    if (!dom.planSelect.value) {
        showFieldError('plan', 'Please select a health plan.');
        valid = false;
    } else { clearFieldError('plan'); }

    // Age
    const age = parseInt(dom.ageSlider.value, 10);
    if (isNaN(age) || age < 18 || age > 75) {
        showFieldError('age', 'Age must be between 18 and 75.');
        valid = false;
    } else { clearFieldError('age'); }

    // Dependants
    const deps = parseInt(dom.dependentsInput.value, 10);
    if (isNaN(deps) || deps < 0 || deps > 10) {
        showFieldError('dependents', 'Number of dependants must be between 0 and 10.');
        valid = false;
    } else { clearFieldError('dependents'); }

    // Province
    if (!dom.provinceSelect.value) {
        showFieldError('province', 'Please select your province.');
        valid = false;
    } else { clearFieldError('province'); }

    return valid;
}

function validateCallbackForm() {
    let valid = true;

    // Name
    const name = dom.cbName.value.trim();
    if (!name || name.length < 2) {
        showCbError('cb-name-error', 'Please enter your full name.');
        dom.cbName.setAttribute('aria-invalid', 'true');
        valid = false;
    } else {
        hideCbError('cb-name-error');
        dom.cbName.removeAttribute('aria-invalid');
    }

    // Phone — basic SA format: 10 digits, starts with 0
    const phone = dom.cbPhone.value.replace(/\s/g, '');
    const phoneRegex = /^0[6-8]\d{8}$/;
    if (!phoneRegex.test(phone)) {
        showCbError('cb-phone-error', 'Enter a valid SA mobile number (e.g. 082 000 0000).');
        dom.cbPhone.setAttribute('aria-invalid', 'true');
        valid = false;
    } else {
        hideCbError('cb-phone-error');
        dom.cbPhone.removeAttribute('aria-invalid');
    }

    // Time
    if (!dom.cbTime.value) {
        showCbError('cb-time-error', 'Please select a preferred callback time.');
        valid = false;
    } else {
        hideCbError('cb-time-error');
    }

    return valid;
}

function showCbError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.hidden = false; }
}

function hideCbError(id) {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.hidden = true; }
}

/* ---------- MODAL ---------- */
let lastFocusedEl = null;

function openModal() {
    document.querySelector('main').setAttribute('aria-hidden', 'true');
    document.querySelector('header').setAttribute('aria-hidden', 'true');
    lastFocusedEl = document.activeElement;
    const total = calculatePremium(
        dom.planSelect.value,
        parseInt(dom.ageSlider.value, 10),
        parseInt(dom.dependentsInput.value, 10),
        dom.provinceSelect.value
    );
    dom.modalEstimate.textContent = total ? `R ${total.toLocaleString('en-ZA')} /month` : 'TBC';
    dom.modalBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => dom.cbName.focus(), 80);
    trapFocus(dom.modalBackdrop);
}

function closeModal() {
    document.querySelector('main').removeAttribute('aria-hidden');
    document.querySelector('header').removeAttribute('aria-hidden');
    dom.modalBackdrop.hidden = true;
    document.body.style.overflow = '';
    dom.callbackForm.reset();
    dom.modalSuccess.hidden = true;
    dom.callbackForm.hidden = false;
    ['cb-name-error', 'cb-phone-error', 'cb-time-error'].forEach(hideCbError);
    if (lastFocusedEl) lastFocusedEl.focus();
}

function trapFocus(el) {
    const focusable = el.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    el.addEventListener('keydown', function handler(e) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
            if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
        if (el.hidden) el.removeEventListener('keydown', handler);
    });
}

/* ---------- MOBILE MENU ---------- */
function openMobileMenu() {
    dom.mobileMenu.hidden = false;
    dom.mobileMenu.setAttribute('aria-hidden', 'false');
    dom.hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // Stagger nav items
    const items = dom.mobileMenu.querySelectorAll('.mobile-nav-item');
    items.forEach((item, i) => {
        item.style.transitionDelay = `${80 + i * 60}ms`;
        setTimeout(() => item.classList.add('revealed'), 10);
    });
    setTimeout(() => dom.mobileClose.focus(), 60);
}

function closeMobileMenu() {
    const items = dom.mobileMenu.querySelectorAll('.mobile-nav-item');
    items.forEach(item => item.classList.remove('revealed'));
    dom.hamburger.setAttribute('aria-expanded', 'false');
    dom.mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { dom.mobileMenu.hidden = true; }, 300);
    dom.hamburger.focus();
}

/* ---------- SCROLL REVEAL ---------- */
function initScrollReveal() {
    const revealEls = document.querySelectorAll('.form-card, .trust-card, .hero-inner');
    revealEls.forEach(el => el.classList.add('reveal'));

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    revealEls.forEach(el => io.observe(el));
}

/* ---------- THEME TOGGLE ---------- */
const THEME_KEY = 'affinity-theme';

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    const isDark = theme === 'dark';
    dom.themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    dom.themeToggle.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

function initTheme() {
    // 1. Saved preference, 2. OS preference, 3. light default
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));

    dom.themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    // Respect OS changes mid-session (only if user hasn't manually set a preference)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? 'dark' : 'light');
    });
}

/* ---------- EVENT BINDINGS ---------- */
function bindEvents() {

    // Plan / Province live update
    dom.planSelect.addEventListener('change', () => { clearFieldError('plan'); updateEstimate(); });
    dom.provinceSelect.addEventListener('change', () => { clearFieldError('province'); updateEstimate(); });

    // Quote form submit → open modal
    dom.quoteForm.addEventListener('submit', e => {
        e.preventDefault();
        if (validateQuoteForm()) openModal();
    });

    // Modal close
    dom.modalClose.addEventListener('click', closeModal);
    dom.modalBackdrop.addEventListener('click', e => {
        if (e.target === dom.modalBackdrop) closeModal();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !dom.modalBackdrop.hidden) closeModal();
    });

    // Callback form submit (mock)
    dom.callbackForm.addEventListener('submit', e => {
        e.preventDefault();
        if (!validateCallbackForm()) return;

        // Simulate async submit
        dom.submitCallback.disabled = true;
        dom.submitCallback.querySelector('span:first-child').textContent = 'Sending…';

        setTimeout(() => {
            dom.callbackForm.hidden = true;
            dom.modalSuccess.hidden = false;
            dom.modalSuccess.querySelector('.success-heading').focus();
        }, 900);
    });

    // Success close
    dom.successClose.addEventListener('click', closeModal);

    // Hamburger
    dom.hamburger.addEventListener('click', openMobileMenu);
    dom.mobileClose.addEventListener('click', closeMobileMenu);

    // Real-time callback validation
    dom.cbPhone.addEventListener('input', () => {
        const phone = dom.cbPhone.value.replace(/\s/g, '');
        if (/^0[6-8]\d{8}$/.test(phone)) {
            hideCbError('cb-phone-error');
            dom.cbPhone.removeAttribute('aria-invalid');
        }
    });

    dom.cbName.addEventListener('input', () => {
        if (dom.cbName.value.trim().length >= 2) {
            hideCbError('cb-name-error');
            dom.cbName.removeAttribute('aria-invalid');
        }
    });
}

/* ---------- INIT ---------- */
function init() {
    populatePlans();
    populateProvinces();
    bindAge();
    bindStepper();
    bindEvents();
    initTheme();
    updateEstimate();

    // Footer year
    if (dom.footerYear) dom.footerYear.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', init);