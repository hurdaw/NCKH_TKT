document.getElementById("formRegister").addEventListener("submit", function(event) {
    event.preventDefault();

    // Lấy giá trị từ các input
    let userName = document.getElementById("userName").value.trim();
    let email = document.getElementById("Email").value.trim();
    let password = document.getElementById("password").value.trim();
    let rePassword = document.getElementById("rePassword").value.trim();

    // Reset thông báo lỗi
    document.getElementById("userNameError").style.display = "none";
    document.getElementById("emailError").style.display = "none";
    document.getElementById("emailFormatError").style.display = "none";
    document.getElementById("passwordError").style.display = "none";
    document.getElementById("rePasswordError").style.display = "none";

    let hasError = false;

    // Kiểm tra nếu tên trống
    if (userName === "") {
        document.getElementById("userNameError").style.display = "block";
        hasError = true;
    }

    // Kiểm tra nếu email trống
    if (email === "") {
        document.getElementById("emailError").style.display = "block";
        hasError = true;
    } else {
        // Kiểm tra nếu email không đúng định dạng @gmail.com
        let gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!gmailPattern.test(email)) {
            document.getElementById("emailFormatError").style.display = "block";
            hasError = true;
        }
    }

    // Kiểm tra nếu mật khẩu trống
    if (password === "") {
        document.getElementById("passwordError").style.display = "block";
        hasError = true;
    }

    // Kiểm tra nếu mật khẩu nhập lại không trùng khớp
    if (password !== rePassword) {
        document.getElementById("rePasswordError").style.display = "block";
        hasError = true;
    }

    // Nếu không có lỗi, tiến hành kiểm tra và lưu trữ
    if (!hasError) {
        // Lấy danh sách người dùng từ localStorage
        let users = JSON.parse(localStorage.getItem("Users")) || [];

        // Kiểm tra xem email đã tồn tại chưa
        let emailExists = users.some(function(user) {
            return user.email === email;
        });

        if (emailExists) {
            alert("Email này đã được đăng ký tài khoản.");
        } else {
            // Thêm người dùng mới vào mảng
            let newUser = {
                userName: userName,
                email: email,
                password: password
            };

            users.push(newUser);

            // Lưu lại mảng người dùng vào localStorage
            localStorage.setItem("Users", JSON.stringify(users));
            alert("Đăng ký thành công!");

            // Chuyển hướng đến trang đăng nhập
            window.location.href = "./login.html";
        }
    }
});
