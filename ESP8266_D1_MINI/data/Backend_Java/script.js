// đa ngôn ngữ 
document.addEventListener("DOMContentLoaded", function() {
    const flags = document.querySelectorAll('.flag');
    
    flags.forEach(flag => {
        flag.addEventListener('click', () => {
            const lang = flag.id;
            changeLanguage(lang);
        });
    });

    function changeLanguage(lang) {
        document.querySelectorAll('[data-en]').forEach(element => {
            element.textContent = element.getAttribute(`data-${lang}`);
        });
    }
});
// dark mode
const body = document.body;
const switch_mode = document.querySelector('#switch-mode i');

    // Load chế độ từ localStorage
    let mode = localStorage.getItem('darkmode');
    if (mode == 'true') {
        body.classList.add('dark');
        switch_mode.className = "bi bi-brightness-high-fill";
    }

    // Sự kiện khi người dùng nhấn nút chuyển đổi
    switch_mode.addEventListener('click', () => {
        switch_mode.classList.toggle('bi-moon-stars-fill');
        switch_mode.classList.toggle('bi-brightness-high-fill');
        let mode = body.classList.toggle('dark');
        
        // Lưu chế độ vào localStorage
        localStorage.setItem('darkmode', mode);
    });
// slideshow

let slideIndex = 1;
showSlides(slideIndex);

// Tự động chuyển slide sau mỗi 5 giây
let autoSlideInterval = setInterval(autoSlides, 5000);

function plusSlides(n) {
    showSlides(slideIndex += n);
    resetInterval();  // Reset lại thời gian tự động chuyển slide
}

function currentSlide(n) {
    showSlides(slideIndex = n);
    resetInterval();  // Reset lại thời gian tự động chuyển slide
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");
    if (n > slides.length) {slideIndex = 1}    
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex-1].style.display = "block";  
    dots[slideIndex-1].className += " active";
}

// Hàm tự động chuyển slide
function autoSlides() {
    slideIndex++;
    showSlides(slideIndex);
}

// Hàm reset thời gian chuyển slide
function resetInterval() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(autoSlides, 5000);
}

// List _ group 
document.querySelector('.dropdown-toggle').addEventListener('click', function(event) {
    event.preventDefault(); // Ngăn chặn chuyển hướng khi nhấn vào "Chức năng"
    let dropdownMenu = this.nextElementSibling;
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
});

// Đóng dropdown khi nhấn ra ngoài
window.addEventListener('click', function(event) {
    if (!event.target.matches('.dropdown-toggle')) {
        let dropdowns = document.querySelectorAll('.dropdown-menu');
        dropdowns.forEach(function(dropdown) {
            dropdown.style.display = 'none';
        });
    }
});

// Giới thiệu linh kiện
// script.js

document.addEventListener('DOMContentLoaded', function() {
    let slideIndex = 1;
    showSlides(slideIndex);

    // Next/previous controls
    function plusSlides(n) {
        showSlides(slideIndex += n);
    }

    // Thumbnail controls
    function currentSlide(n) {
        showSlides(slideIndex = n);
    }

    function showSlides(n) {
        let i;
        const slides = document.querySelectorAll('.item');
        const thumbnails = document.querySelectorAll('.thumb li');

        // Wrap around slides
        if (n > slides.length) {slideIndex = 1}
        if (n < 1) {slideIndex = slides.length}

        // Hide all slides
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }

        // Remove 'selected' class from all thumbnails
        for (i = 0; i < thumbnails.length; i++) {
            thumbnails[i].classList.remove('selected');
        }

        // Show current slide and highlight the corresponding thumbnail
        slides[slideIndex - 1].style.display = "flex";
        thumbnails[slideIndex - 1].classList.add('selected');
    }

    // Event listeners for navigation buttons
    document.querySelector('.prev').addEventListener('click', function() {
        plusSlides(-1);
    });

    document.querySelector('.next').addEventListener('click', function() {
        plusSlides(1);
    });

    // Event listeners for thumbnails
    const thumbnailItems = document.querySelectorAll('.thumb li');
    thumbnailItems.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', function() {
            currentSlide(index + 1);
        });
    });
});

// Hiển thị nút "Back to top" khi cuộn xuống dưới
window.addEventListener("scroll", function() {
    const backToTopButton = document.querySelector(".back-to-top");
    if (window.scrollY > 200) {
        backToTopButton.classList.add("show-back-to-top");
    } else {
        backToTopButton.classList.remove("show-back-to-top");
    }
});

// Cuộn về đầu trang khi nhấp vào nút
document.querySelector(".back-to-top").addEventListener("click", function(e) {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

