// Element của trang
const formLogin = document.getElementById("formLogin");
const emailElement = document.getElementById("email");
const passwordElement = document.getElementById("password");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

// Lắng nghe sự kiện submit form đăng nhập tài khoản
formLogin.addEventListener("submit", function(e) {
    // Ngăn chặn sự kiện load lại trang
    e.preventDefault();

    // Ẩn các thông báo lỗi trước khi kiểm tra
    emailError.style.display = "none";
    passwordError.style.display = "none";

    // Kiểm tra xem email và mật khẩu có để trống không
    let isValid = true;

    if (emailElement.value.trim() === "") {
        emailError.style.display = "block";
        isValid = false;
    }

    if (passwordElement.value.trim() === "") {
        passwordError.style.display = "block";
        isValid = false;
    }

    // Nếu dữ liệu không hợp lệ, dừng quá trình submit
    if (!isValid) return;

    // Lấy dữ liệu từ local về
    const userLocal = JSON.parse(localStorage.getItem("Users")) || [];

    // Tìm kiếm email và mật khẩu người dùng nhập vào có tồn tại trên local
    const findUser = userLocal.find(
        (user) => 
            user.email === emailElement.value && 
            user.password === passwordElement.value
    );

    // Nếu không tìm thấy người dùng thì thông báo cho người dùng nhập lại dữ liệu
    if (!findUser) {
        alert("Email hoặc mật khẩu không đúng");
    } else {
        // Nếu có thì đăng nhập thành công và chuyển hướng về trang chủ
        window.location.href = "index.html";

        // Lưu thông tin của user đăng nhập lên local
        // localStorage.setItem("userLogin", JSON.stringify(findUser));
    }
});

// con mắt password
const togglePassword = document.querySelector("#togglePassword");
const password = document.querySelector("#password");

togglePassword.addEventListener("click", function () {
    const type = password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);

    // Toggle between fa-eye and fa-eye-slash
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
});
