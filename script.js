// ============================
// CONFIGURATION VARIABLES
// ============================
const WHATSAPP_NUMBER = "918248897608"; 
const CONTACT_PHONE = "+918248897608";   
const CONTACT_EMAIL = "hennabykomz@gmail.com"; 

document.getElementById("phoneLink").href = `tel:${CONTACT_PHONE}`;
document.getElementById("emailLink").href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Henna Booking Inquiry")}`;

const generalWhatsAppMsg = encodeURIComponent("Hello Komz, I would love to inquire about your henna designs and booking availability!");
document.getElementById("footerWhatsappLink").href = `https://wa.me/${WHATSAPP_NUMBER}?text=${generalWhatsAppMsg}`;


// ============================
// SCROLL REVEAL ANIMATION
// ============================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("active");
        }
    });
}, {
    threshold: 0.15
});

function observeReveal(el) {
    revealObserver.observe(el);
}

document.querySelectorAll(".reveal").forEach(observeReveal);


// ===================================
// ALBUM FOLDERS & MASTER COLLECTION
// ===================================
const galleryFolders = document.getElementById("galleryFolders");
const galleryOverlay = document.getElementById("galleryOverlay");
const galleryViewerTitle = document.getElementById("galleryViewerTitle");
const galleryViewerGrid = document.getElementById("galleryViewerGrid");
const viewAllCard = document.getElementById("viewAllCard");
const viewAllCount = document.getElementById("viewAllCount");

let galleryData = [];
let masterImageList = [];

fetch("gallery.json")
    .then(response => response.json())
    .then(collections => {
        galleryData = collections;

        collections.forEach((collection, index) => {
            collection.images.forEach(filename => {
                masterImageList.push({
                    title: collection.title,
                    src: `images/gallery/${collection.folder}/${filename}`
                });
            });

            const card = document.createElement("div");
            card.className = "folder-card reveal";

            if (collection.images.length === 0) {
                card.classList.add("empty");
                card.innerHTML = `
                    <div class="folder-empty-text">
                        <h3>${collection.title}</h3>
                        <span>Coming soon</span>
                    </div>
                `;
            } else {
                const coverImage = `images/gallery/${collection.folder}/${collection.images[0]}`;
                card.innerHTML = `
                    <img src="${coverImage}" alt="${collection.title}">
                    <div class="folder-overlay">
                        <h3>${collection.title}</h3>
                        <span>${collection.images.length} photo${collection.images.length > 1 ? "s" : ""}</span>
                    </div>
                `;
                card.addEventListener("click", () => openGalleryViewer(index));
            }

            galleryFolders.appendChild(card);
            observeReveal(card);
        });

        if(viewAllCount) {
            viewAllCount.textContent = `${masterImageList.length} Total Master Photos`;
        }
    })
    .catch(error => {
        console.error("Could not load gallery.json:", error);
    });

if(viewAllCard) {
    viewAllCard.addEventListener("click", () => {
        galleryViewerTitle.textContent = "Master Collection";
        galleryViewerGrid.innerHTML = "";

        masterImageList.forEach(item => {
            const img = document.createElement("img");
            img.src = item.src;
            img.alt = item.title;
            img.className = "gallery-item-thumb";
            
            img.addEventListener("click", () => openLightbox(item.src));
            galleryViewerGrid.appendChild(img);
        });

        galleryOverlay.classList.add("show");
    });
}

function openGalleryViewer(index) {
    const collection = galleryData[index];
    galleryViewerTitle.textContent = collection.title;
    galleryViewerGrid.innerHTML = "";

    collection.images.forEach((filename) => {
        const fullSrc = `images/gallery/${collection.folder}/${filename}`;
        const img = document.createElement("img");
        img.src = fullSrc;
        img.alt = collection.title;
        img.className = "gallery-item-thumb";
        
        img.addEventListener("click", () => openLightbox(fullSrc));
        galleryViewerGrid.appendChild(img);
    });

    galleryOverlay.classList.add("show");
}

function closeGalleryViewer() {
    galleryOverlay.classList.remove("show");
}

galleryOverlay.addEventListener("click", (e) => {
    if (e.target === galleryOverlay) closeGalleryViewer();
});


// ============================================
// INSTAGRAM LIGHTBOX WITH NATIVE ZOOM ENGINE
// ============================================
const instagramLightbox = document.getElementById("instagramLightbox");
const lightboxTargetImage = document.getElementById("lightboxTargetImage");
const lightboxZoomWrapper = document.getElementById("lightboxZoomWrapper");

function openLightbox(imageSrc) {
    lightboxTargetImage.src = imageSrc;
    instagramLightbox.classList.add("show");
    resetZoomEngine();
}

function closeLightbox() {
    instagramLightbox.classList.remove("show");
    setTimeout(resetZoomEngine, 200); 
}

instagramLightbox.addEventListener("click", (e) => {
    if (e.target === instagramLightbox || e.target === lightboxZoomWrapper) {
        closeLightbox();
    }
});

let scale = 1, lastScale = 1;
let startX = 0, startY = 0;
let posX = 0, posY = 0;
let lastPosX = 0, lastPosY = 0;
let lastTap = 0;

function resetZoomEngine() {
    scale = 1; lastScale = 1;
    startX = 0; startY = 0;
    posX = 0; posY = 0;
    lastPosX = 0; lastPosY = 0;
    if(lightboxTargetImage) {
        lightboxTargetImage.style.transform = `translate(0px, 0px) scale(1)`;
    }
}

if(lightboxZoomWrapper && lightboxTargetImage) {
    lightboxZoomWrapper.addEventListener("touchend", function (e) {
        let now = new Date().getTime();
        let timespan = now - lastTap;
        if (timespan < 300 && timespan > 0) {
            e.preventDefault();
            if (scale > 1) {
                resetZoomEngine();
            } else {
                scale = 2.5;
                updateTransform();
            }
        }
        lastTap = now;
    });

    lightboxZoomWrapper.addEventListener("touchstart", function (e) {
        if (e.touches.length === 2) {
            lastScale = scale;
        } else if (e.touches.length === 1 && scale > 1) {
            startX = e.touches[0].clientX - lastPosX;
            startY = e.touches[0].clientY - lastPosY;
        }
    });

    lightboxZoomWrapper.addEventListener("touchmove", function (e) {
        if (e.touches.length === 1 && scale > 1) {
            e.preventDefault();
            posX = e.touches[0].clientX - startX;
            posY = e.touches[0].clientY - startY;
            updateTransform();
        }
    });

    lightboxZoomWrapper.addEventListener("touchend", function (e) {
        lastPosX = posX;
        lastPosY = posY;
        if (scale <= 1) resetZoomEngine();
    });
}

function updateTransform() {
    if (scale > 1) {
        let limitX = (scale - 1) * (lightboxZoomWrapper.offsetWidth / 2);
        let limitY = (scale - 1) * (lightboxZoomWrapper.offsetHeight / 2);
        posX = Math.max(-limitX, Math.min(limitX, posX));
        posY = Math.max(-limitY, Math.min(limitY, posY));
    }
    lightboxTargetImage.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}


// ============================
// BOOKING MODAL
// ============================
const bookingOverlay = document.getElementById("bookingOverlay");
const bookingForm = document.getElementById("bookingFormFields");

function openBookingForm() {
    bookingOverlay.classList.add("show");
}

function closeBookingForm() {
    bookingOverlay.classList.remove("show");
}

bookingOverlay.addEventListener("click", (e) => {
    if (e.target === bookingOverlay) closeBookingForm();
});

bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("service").value;
    const date = document.getElementById("date").value;
    const message = document.getElementById("message").value.trim();

    const text = `New Booking Request\n\nName: ${name}\nPhone: ${phone}\nService: ${service}\nPreferred Date: ${date}\nNotes: ${message || "None"}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    bookingForm.reset();
    closeBookingForm();
});


// ============================================
// ABOUT SINGLE CURVED CURTAIN
// ============================================
const aboutContainer = document.querySelector(".about-image-container");
if (aboutContainer) {
    const maskObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const curtain = entry.target.querySelector(".single-curtain");
            const image = entry.target.querySelector(".about-image");

            if (entry.isIntersecting) {
                curtain.animate([
                    { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 75% 20%, 45% 55%, 15% 85%, 0% 100%)" },
                    { clipPath: "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%)" }
                ], {
                    duration: 1600,
                    easing: "cubic-bezier(0.25, 1, 0.5, 1)", 
                    fill: "forwards"
                });
                image.style.transform = "scale(1)";
            } else {
                curtain.style.clipPath = "polygon(0% 0%, 100% 0%, 100% 0%, 75% 20%, 45% 55%, 15% 85%, 0% 100%)";
                image.style.transform = "scale(1.15)";
            }
        });
    }, { threshold: 0.1 });
    maskObserver.observe(aboutContainer);
}
// SECURITY: ANTI-THEFT DRAG & KEYBOARD INSPECTION SHIELD
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('dragstart', (e) => e.preventDefault());
    
    // Explicitly allow custom click events for your website's gallery functions
    img.style.pointerEvents = 'auto'; 
});
document.addEventListener('keydown', function(e) {
    // Block F12 (Inspect Element)
    if (e.keyCode === 123) {
        e.preventDefault();
        return false;
    }
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        return false;
    }
    if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
    }
});
const protectedImages = [
    document.querySelector('.about-image'), // The Artist Profile image
    document.getElementById('galleryFolders'), // Main Gallery Folders
    document.getElementById('galleryViewerGrid'), // Inner Popup Gallery Images
    document.getElementById('lightboxTargetImage') // Zoomed Lightbox view
];


function activateImageShield() {
    protectedImages.forEach(el => {
        if (el) el.classList.add('screenshot-shield-active');
    });
}

function deactivateImageShield() {
    protectedImages.forEach(el => {
        if (el) el.classList.remove('screenshot-shield-active');
    });
}
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        activateImageShield();
    } else {
        // Drop shield safely after they return to normal view
        setTimeout(deactivateImageShield, 600);
    }
});

window.addEventListener('blur', function() {
    activateImageShield();
    setTimeout(deactivateImageShield, 600);
});

document.addEventListener('keyup', function(e) {
    // If they click the "Print Screen" key
    if (e.key === 'PrintScreen' || e.keyCode === 44) {
        activateImageShield();
        navigator.clipboard.writeText("Screenshot Protected by Henna by Komz"); // Clear their clipboard data
        alert("Screenshots are strictly disabled to protect original artwork assets.");
        setTimeout(deactivateImageShield, 1000);
    }
});


document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
        activateImageShield();
        setTimeout(deactivateImageShield, 2000);
    }
});
