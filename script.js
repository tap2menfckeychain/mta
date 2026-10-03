/* ================= CẤU HÌNH ================= */

const CONFIG = {

    // Âm lượng nhạc nền (0 → 1).
    amLuong: .85
};


const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;



/* ================= CHIỀU CAO MÀN HÌNH THẬT ================= */

// Trên iPhone (Safari, Zalo, Messenger...) 100vh tính cả phần bị thanh công cụ che,
// nên nội dung bị cắt. Đo chiều cao thật rồi đưa vào biến CSS --vh.

let lastWidth = 0;
let lastHeight = 0;


function setViewportUnit(force) {

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Thanh địa chỉ co/giãn khi cuộn chỉ đổi chiều cao một chút -> bỏ qua để trang không bị giật
    if (!force && w === lastWidth && Math.abs(h - lastHeight) < 160) return;

    lastWidth = w;
    lastHeight = h;

    document.documentElement.style.setProperty("--vh", (h * .01) + "px");
}


setViewportUnit(true);

window.addEventListener("resize", function () { setViewportUnit(false); });

window.addEventListener("orientationchange", function () {
    setTimeout(function () { setViewportUnit(true); }, 300);
});



/* ================= BỤI NẮNG ================= */

function initDust(canvas) {

    const ctx = canvas.getContext("2d");
    const count = Number(canvas.dataset.dust) || 60;

    const motes = Array.from({ length: count }, function () {
        return {
            x: Math.random(),
            y: Math.random(),
            r: Math.random() * 1.8 + .4,
            vy: Math.random() * .0006 + .0002,
            drift: Math.random() * Math.PI * 2,
            alpha: Math.random() * .5 + .25
        };
    });

    let width = 0;
    let height = 0;
    let onScreen = true;


    function resize() {

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        width = canvas.offsetWidth;
        height = canvas.offsetHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }


    function draw() {

        ctx.clearRect(0, 0, width, height);

        motes.forEach(function (m) {

            m.y -= m.vy;
            m.drift += .01;

            if (m.y < -.02) {
                m.y = 1.02;
                m.x = Math.random();
            }

            const x = (m.x + Math.sin(m.drift) * .01) * width;
            const y = m.y * height;

            const glow = ctx.createRadialGradient(x, y, 0, x, y, m.r * 3);
            glow.addColorStop(0, "rgba(255, 220, 140," + m.alpha + ")");
            glow.addColorStop(1, "rgba(255, 220, 140, 0)");

            ctx.beginPath();
            ctx.arc(x, y, m.r * 3, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();
        });
    }


    function loop() {

        if (onScreen && width > 0) draw();

        requestAnimationFrame(loop);
    }


    new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
    }).observe(canvas);


    window.addEventListener("resize", resize);

    resize();

    if (reduceMotion) draw();
    else loop();
}


document
    .querySelectorAll("canvas.dust")
    .forEach(initDust);



/* ================= NHẠC NỀN ================= */

const music = document.getElementById("backgroundMusic");
const player = document.getElementById("player");
const playerToggle = document.getElementById("playerToggle");
const playerIcon = document.getElementById("playerIcon");

let userPaused = false;
let fadeTimer = null;


function setPlaying(on) {

    player.classList.toggle("playing", on);
    playerIcon.textContent = on ? "❚❚" : "▶";
}


function fadeIn() {

    clearInterval(fadeTimer);

    music.volume = 0;

    // iPhone không cho chỉnh âm lượng bằng code -> vòng lặp tự dừng ngay
    fadeTimer = setInterval(function () {

        const next = Math.min(music.volume + .04, CONFIG.amLuong);

        music.volume = next;

        if (music.volume >= CONFIG.amLuong || next >= CONFIG.amLuong) clearInterval(fadeTimer);

    }, 80);
}


function startMusic() {

    if (!music.paused) return;

    music.volume = 0;

    const attempt = music.play();

    if (attempt && attempt.then) {
        attempt.then(fadeIn).catch(function () { setPlaying(false); });
    }
    else {
        fadeIn();
    }
}


music.addEventListener("play", function () { setPlaying(true); });
music.addEventListener("pause", function () { setPlaying(false); });


playerToggle.addEventListener("click", function () {

    if (music.paused) {
        userPaused = false;
        startMusic();
    }
    else {
        userPaused = true;
        music.pause();
    }
});


// Trình duyệt chặn tự phát nhạc cho tới khi người xem chạm vào trang:
// thử phát ngay, nếu bị chặn thì phát ở lần chạm / bấm phím đầu tiên.
startMusic();

["touchend", "click", "keydown"].forEach(function (type) {

    window.addEventListener(type, function once() {

        if (!userPaused && music.paused) startMusic();

        window.removeEventListener(type, once);

    }, { passive: true });
});



/* ================= MỞ CỔNG ================= */

const gate = document.getElementById("gate");
const openGate = document.getElementById("openGate");

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

window.scrollTo(0, 0);


document
    .querySelectorAll(".reveal-hero, .reveal-line")
    .forEach(function (el, i) {
        el.style.setProperty("--d", (.5 + i * .14) + "s");
    });


openGate.addEventListener("click", function () {

    if (gate.classList.contains("opening")) return;

    startMusic();

    gate.classList.add("opening");

    setTimeout(function () {

        window.scrollTo(0, 0);

        document.body.classList.remove("is-locked");
        document.body.classList.add("is-ready");

        onScroll();

    }, reduceMotion ? 0 : 700);

    setTimeout(function () {
        gate.style.display = "none";
    }, reduceMotion ? 50 : 1500);
});



/* ================= HIỆN DẦN KHI CUỘN ================= */

document
    .querySelectorAll(".gallery, .day-cards, .pillars")
    .forEach(function (group) {

        Array.from(group.children).forEach(function (child, i) {
            child.style.setProperty("--delay", (i * .12) + "s");
        });
    });


const revealObserver = new IntersectionObserver(function (entries) {

    entries.forEach(function (entry) {

        if (!entry.isIntersecting) return;

        const el = entry.target;

        el.classList.add("visible");
        revealObserver.unobserve(el);

        setTimeout(function () {
            el.style.removeProperty("--delay");
        }, 1800);
    });

}, {
    threshold: .12,
    rootMargin: "0px 0px -5% 0px"
});


document
    .querySelectorAll("[data-reveal]")
    .forEach(function (el) {
        revealObserver.observe(el);
    });



/* ================= CUỘN: NAVBAR, ẢNH NỀN ================= */

const navbar = document.getElementById("navbar");
const heroMedia = document.querySelector(".hero-media");

let ticking = false;


function onScroll() {

    const y = window.pageYOffset;

    navbar.classList.toggle("scrolled", y > 40);

    if (!reduceMotion && y < window.innerHeight * 1.2) {
        heroMedia.style.transform = "translate3d(0," + (y * .3) + "px,0)";
    }

    ticking = false;
}


window.addEventListener("scroll", function () {

    if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
    }

}, { passive: true });


onScroll();



/* ================= THẺ "MỖI NGÀY MỘT LẦN TÔI LUYỆN" ================= */

const dayCards = document.querySelectorAll(".day-card");


function activateDay(card) {

    dayCards.forEach(function (c) {
        c.classList.toggle("active", c === card);
    });
}


dayCards.forEach(function (card) {

    card.addEventListener("mouseenter", function () { activateDay(card); });
    card.addEventListener("click", function () { activateDay(card); });
});



/* ================= XEM ẢNH ================= */

const lightbox = document.getElementById("lightbox");
const lightboxImg = lightbox.querySelector("img");


document
    .querySelectorAll(".gallery figure, .framed")
    .forEach(function (figure) {

        figure.style.cursor = "pointer";

        figure.addEventListener("click", function () {

            const img = figure.querySelector("img");

            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add("open");
        });
    });


lightbox.addEventListener("click", function () {
    lightbox.classList.remove("open");
});


document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") lightbox.classList.remove("open");
});



/* ================= SAO BAY ================= */

const starColors = ["#e8b04a", "#f6d891", "#ffdd55", "#d2281e", "#ffffff"];


function burstStars(x, y, amount) {

    const spread = Math.min(300, window.innerWidth * .75);

    for (let i = 0; i < amount; i++) {

        const star = document.createElement("span");

        star.className = "float-star";
        star.textContent = "★";

        star.style.left = x + "px";
        star.style.top = y + "px";
        star.style.setProperty("--dx", (Math.random() * spread - spread / 2) + "px");
        star.style.setProperty("--dy", -(Math.random() * 280 + 160) + "px");
        star.style.setProperty("--rot", (Math.random() * 120 - 60) + "deg");
        star.style.setProperty("--size", (Math.random() * 18 + 12) + "px");
        star.style.setProperty("--time", (Math.random() * 1.2 + 1.6) + "s");
        star.style.setProperty("--color", starColors[i % starColors.length]);

        star.addEventListener("animationend", function () {
            star.remove();
        });

        document.body.appendChild(star);
    }
}


function centerOf(el) {

    const rect = el.getBoundingClientRect();

    return [rect.left + rect.width / 2, rect.top + rect.height / 2];
}



/* ================= KÝ QUYẾT TÂM ================= */

const nameInput = document.getElementById("cadetName");
const signButton = document.getElementById("signButton");
const certificate = document.getElementById("certificate");
const certName = document.querySelector(".js-cert-name");
const certSign = document.querySelector(".js-cert-sign");

const EMPTY_NAME = "..................";


function readSavedName() {
    try { return localStorage.getItem("hv-ten") || ""; }
    catch (error) { return ""; }
}


function saveName(name) {
    try { localStorage.setItem("hv-ten", name); }
    catch (error) { /* trình duyệt chặn lưu trữ: bỏ qua */ }
}


function renderName() {

    const name = nameInput.value.trim();

    certName.textContent = name || EMPTY_NAME;
    certSign.textContent = certificate.classList.contains("signed") ? name : "";
}


function sign() {

    const name = nameInput.value.trim();

    if (!name) {
        nameInput.focus();
        return;
    }

    saveName(name);

    certificate.classList.remove("signed");
    void certificate.offsetWidth;
    certificate.classList.add("signed");

    renderName();

    const pos = centerOf(document.getElementById("certSeal"));

    burstStars(pos[0], pos[1], 22);
}


nameInput.addEventListener("input", renderName);

nameInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") sign();
});

signButton.addEventListener("click", sign);


nameInput.value = readSavedName();
renderName();



/* ================= TIẾP THÊM LỬA ================= */

const fireButton = document.getElementById("fireButton");
const fireText = document.getElementById("fireText");

const fireMessages = [
    "Kỷ luật là sức mạnh!",
    "Trí tuệ tỏa sáng!",
    "Nhiệm vụ nào cũng hoàn thành!",
    "Khó khăn nào cũng vượt qua!",
    "Vì Tổ quốc — sẵn sàng!",
    "Bố mẹ ơi, con sẽ làm được!"
];

let fires = 0;


fireButton.addEventListener("click", function () {

    const pos = centerOf(fireButton);

    burstStars(pos[0], pos[1], 20);

    fireText.textContent = fireMessages[fires % fireMessages.length];

    fires++;

    fireText.classList.remove("pop");
    void fireText.offsetWidth;
    fireText.classList.add("pop");
});
