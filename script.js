
/*
  غيّر بيانات الدعوة من هنا فقط.
  التاريخ بالتنسيق: YYYY-MM-DDTHH:mm:ss
  (بتوقيت جهاز الزائر المحلي).
*/

const INVITATION = {
  groom: "محمد",
  bride: "ميرنا",
  date: "2026-12-11T20:00:00",
  venue: "قاعة مريال ب",
  timeLabel: "الساعة ٨ مساءً",
  mapUrl: "https://maps.app.goo.gl/jgwEKQyV2vvRYcqF9",

  musicUrl: "/song.mp3",

  galleryImage1: "/7A2A46034368.JPG",
  galleryImage2: "/7A2A46064371.JPG"
};

const $ = id => document.getElementById(id);

const eventDate = new Date(INVITATION.date);

const arabicDate = eventDate.toLocaleDateString("ar-EG", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

const englishDate = eventDate.toLocaleDateString("en-US", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

// Fill invitation information.

$("groomName").textContent = INVITATION.groom;
$("brideName").textContent = INVITATION.bride;

$("introNames").textContent =
  `${INVITATION.groom} و ${INVITATION.bride}`;

$("footerNames").textContent =
  `${INVITATION.groom} و ${INVITATION.bride}`;

$("venueName").textContent = INVITATION.venue;
$("eventTime").textContent = INVITATION.timeLabel;

$("mapLink").href = INVITATION.mapUrl;

$("heroDate").textContent = arabicDate;
$("detailDate").textContent = arabicDate;

if (INVITATION.galleryImage1) {
  $("galleryImage1").src = INVITATION.galleryImage1;
}

if (INVITATION.galleryImage2) {
  $("galleryImage2").src = INVITATION.galleryImage2;
}

if (INVITATION.musicUrl) {
  $("backgroundMusic").src = INVITATION.musicUrl;
}

// Countdown.

function updateCountdown() {
  let diff = Math.max(0, eventDate.getTime() - Date.now());

  const values = {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff % 86400000 / 3600000),
    minutes: Math.floor(diff % 3600000 / 60000),
    seconds: Math.floor(diff % 60000 / 1000)
  };

  Object.entries(values).forEach(([id, value]) => {
    $(id).textContent = String(value).padStart(2, "0");
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);


// Envelope opening animation.

let invitationOpened = false;

function openInvite() {
  if (invitationOpened) return;

  invitationOpened = true;

  const intro = $("introScreen");
  const invitation = $("invitation");

  // Start opening the envelope.
  intro.classList.add("opening");

  // Give the envelope animation time to play.
  setTimeout(() => {

    intro.classList.add("closed");

    invitation.classList.remove("is-locked");

    document.body.style.overflow = "auto";

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }, 900);
}

$("openInvitation").addEventListener("click", openInvite);
$("introHint").addEventListener("click", openInvite);

document.body.style.overflow = "hidden";


// Reveal sections when they enter the viewport.

const revealObserver = new IntersectionObserver(entries => {

  entries.forEach(entry => {

    if (entry.isIntersecting) {

      entry.target.classList.add("visible");

      revealObserver.unobserve(entry.target);

    }

  });

}, {
  threshold: 0.12
});

document.querySelectorAll(".reveal").forEach(el => {
  revealObserver.observe(el);
});


// Language switching.

let language = "ar";

$("languageToggle").addEventListener("click", () => {

  language = language === "ar" ? "en" : "ar";

  document.documentElement.lang = language;

  document.documentElement.dir =
    language === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-ar][data-en]").forEach(el => {
    el.innerHTML = el.dataset[language];
  });

  $("languageToggle").textContent =
    language === "ar" ? "GB English" : "عربي";

  $("heroDate").textContent =
    language === "ar" ? arabicDate : englishDate;

  $("detailDate").textContent =
    language === "ar" ? arabicDate : englishDate;

  $("eventTime").textContent =
    language === "ar"
      ? INVITATION.timeLabel
      : eventDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit"
        });

  $("guestName").placeholder =
    language === "ar" ? "اسمك" : "Your name";

  $("guestMessage").placeholder =
    language === "ar"
      ? "اكتب تهنئتك هنا..."
      : "Write your wishes here...";

});


// Add wedding date to calendar.

$("calendarButton").addEventListener("click", () => {

  const end = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000);

  const stamp = d =>
    d.toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//EN",
    "BEGIN:VEVENT",
    `DTSTART:${stamp(eventDate)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${INVITATION.groom} & ${INVITATION.bride} Wedding`,
    `LOCATION:${INVITATION.venue}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const url = URL.createObjectURL(
    new Blob([content], {
      type: "text/calendar;charset=utf-8"
    })
  );

  const a = document.createElement("a");

  a.href = url;
  a.download = "wedding-invitation.ics";

  a.click();

  URL.revokeObjectURL(url);

});


// Background music.

$("musicToggle").addEventListener("click", async () => {

  const audio = $("backgroundMusic");

  if (!INVITATION.musicUrl) {

    alert(
      language === "ar"
        ? "أضف رابط ملف الموسيقى في musicUrl داخل script.js أولاً."
        : "Add your music file URL to musicUrl in script.js first."
    );

    return;
  }

  try {

    if (audio.paused) {

      await audio.play();

      $("musicToggle").classList.add("playing");

    } else {

      audio.pause();

      $("musicToggle").classList.remove("playing");

    }

  } catch (e) {

    console.warn("Audio playback was blocked:", e);

  }

});


// Floating lavender particles.

const canvas = $("particles");
const ctx = canvas.getContext("2d");

let particles = [];

function resizeCanvas() {

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;

  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  particles = Array.from(
    {
      length: Math.min(65, Math.floor(innerWidth / 18))
    },
    () => ({

      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,

      r: Math.random() * 1.35 + .45,
      a: Math.random() * .4 + .12,

      s: Math.random() * .22 + .06,

      phase: Math.random() * Math.PI * 2

    })
  );

}

function drawParticles(t) {

  ctx.clearRect(0, 0, innerWidth, innerHeight);

  particles.forEach(p => {

    p.y -= p.s;

    if (p.y < -5) {

      p.y = innerHeight + 5;
      p.x = Math.random() * innerWidth;

    }

    const alpha =
      p.a * (.65 + .35 * Math.sin(t * .001 + p.phase));

    ctx.beginPath();

    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

    ctx.fillStyle = `rgba(169, 133, 202, ${alpha})`;

    ctx.fill();

  });

  requestAnimationFrame(drawParticles);

}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

requestAnimationFrame(drawParticles);


// Guestbook.
// Messages are stored locally in this browser only.
// A server is needed for shared submissions.

$("messageForm").addEventListener("submit", event => {

  event.preventDefault();

  const item = {

    name: $("guestName").value.trim(),

    message: $("guestMessage").value.trim(),

    date: new Date().toISOString()

  };

  if (!item.name || !item.message) return;

  try {

    const saved = JSON.parse(
      localStorage.getItem("weddingGuestbook") || "[]"
    );

    saved.push(item);

    localStorage.setItem(
      "weddingGuestbook",
      JSON.stringify(saved)
    );

    $("messageForm").reset();

    $("successMessage").hidden = false;

  } catch (error) {

    console.warn("Could not save guestbook message:", error);

    alert(
      language === "ar"
        ? "تعذر حفظ الرسالة على هذا الجهاز."
        : "Could not save your message on this device."
    );

  }

});
