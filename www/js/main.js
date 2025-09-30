// Mobile navigation toggle
const menuToggleButton = document.querySelector('.menu-toggle');
const nav = document.getElementById('primary-nav');
const overlay = document.querySelector('[data-overlay]');
const root = document.documentElement;

function setScrollLock(locked){
    if(locked){
        root.style.overflow = 'hidden';
    }else{
        root.style.overflow = '';
    }
}

function setNavOpen(open){
    if(!nav || !menuToggleButton) return;
    nav.classList.toggle('open', open);
    menuToggleButton.setAttribute('aria-expanded', String(open));
    if(overlay){ overlay.setAttribute('aria-hidden', String(!open)); }
    setScrollLock(open);
}

if (menuToggleButton && nav) {
    menuToggleButton.addEventListener('click', () => setNavOpen(!nav.classList.contains('open')));
}

if(overlay){
    overlay.addEventListener('click', () => setNavOpen(false));
}

// Brands mega-menu (mobile expand)
document.querySelectorAll('.has-mega').forEach((item)=>{
    const toggle = item.querySelector('.mega-toggle');
    if(!toggle) return;
    toggle.addEventListener('click', (e)=>{
        // On desktop hover handles it; on mobile we toggle class
        if(window.matchMedia('(max-width: 900px)').matches){
            e.preventDefault();
            const isOpen = item.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        }
    });
});

window.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && nav?.classList.contains('open')){
        setNavOpen(false);
    }
});

// Theme switcher (gold / pink)
function applyTheme(theme){
    const body = document.body;
    body.classList.remove('theme-gold','theme-pink');
    if(theme === 'gold') body.classList.add('theme-gold');
    if(theme === 'pink') body.classList.add('theme-pink');
    try{ localStorage.setItem('ui-theme', theme); }catch(_){/* ignore */}
}

function initTheme(){
    let theme = 'gold';
    try{ theme = localStorage.getItem('ui-theme') || 'gold'; }catch(_){/* ignore */}
    applyTheme(theme);
}

initTheme();

// Hook up theme toggle button
function setThemeToggleLabel(button){
    if(!button) return;
    const isPink = document.body.classList.contains('theme-pink');
    button.textContent = isPink ? 'Gold' : 'Pink';
}

const themeToggleButton = document.querySelector('[data-theme-toggle]');
if(themeToggleButton){
    setThemeToggleLabel(themeToggleButton);
    themeToggleButton.addEventListener('click', ()=>{
        const isPink = document.body.classList.contains('theme-pink');
        applyTheme(isPink ? 'gold' : 'pink');
        setThemeToggleLabel(themeToggleButton);
    });
}

// Dynamic header offset for mobile (prevents content underlap)
function updateHeaderOffset(){
    const header = document.querySelector('.site-header');
    if(!header) return;
    const height = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', height + 'px');
}

window.addEventListener('load', updateHeaderOffset);
window.addEventListener('resize', () => { requestAnimationFrame(updateHeaderOffset); });
window.addEventListener('orientationchange', () => { setTimeout(updateHeaderOffset, 200); });

// Side drawer (mobile)
const drawer = document.querySelector('[data-drawer]');
const drawerClose = document.querySelector('[data-drawer-close]');
function openDrawer(){ drawer?.classList.add('open'); setScrollLock(true); }
function closeDrawer(){ drawer?.classList.remove('open'); setScrollLock(false); }

// Reuse hamburger to open drawer on mobile
if (menuToggleButton) {
    menuToggleButton.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 900px)').matches) {
            openDrawer();
        }
    });
}
if (drawerClose) { drawerClose.addEventListener('click', closeDrawer); }
window.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ closeDrawer(); }});

// Drawer accordions
document.querySelectorAll('[data-accordion]').forEach(btn => {
    btn.addEventListener('click', () => {
        const li = btn.closest('.drawer__item');
        if (!li) return;
        li.classList.toggle('open');
    });
});

// Very lightweight slider controls (horizontal scroll)
const slider = document.querySelector('[data-slider]');
const prev = document.querySelector('.slider-prev');
const next = document.querySelector('.slider-next');
const scrollAmount = 320;
if (slider && prev && next) {
    prev.addEventListener('click', () => slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
    next.addEventListener('click', () => slider.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
}

// Newsletter (demo)
const newsletter = document.querySelector('.newsletter');
if (newsletter) {
    newsletter.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = newsletter.querySelector('input[type="email"]');
        if (input && input.value) {
            alert(`Subscribed: ${input.value}`);
            input.value = '';
        }
    });
}


