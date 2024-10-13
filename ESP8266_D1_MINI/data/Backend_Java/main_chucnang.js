function goBack() {
    window.history.back();
}

document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('barChart').getContext('2d');

    // Khởi tạo biểu đồ
    const barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [], // Thời gian sẽ được cập nhật
            datasets: [{
                label: 'Nhiệt độ cơ thể (°C)',
                data: [], // Dữ liệu sẽ được cập nhật
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Thời gian'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Nhiệt độ (°C)'
                    },
                    beginAtZero: false
                }
            }
        }
    });

    // Hàm để cập nhật dữ liệu biểu đồ
    function updateChart() {
        const now = new Date();
        const currentTime = now.toLocaleTimeString();

        // Thêm dữ liệu mới vào biểu đồ
        if (barChart.data.labels.length >= 6) {
            barChart.data.labels.shift(); // Xóa nhãn cũ nhất nếu vượt quá 6 tháng
            barChart.data.datasets[0].data.shift(); // Xóa dữ liệu cũ nhất
        }

        barChart.data.labels.push(currentTime);
        barChart.data.datasets[0].data.push(36.5 + Math.random() * 1); // Cập nhật nhiệt độ ngẫu nhiên

        barChart.update();
        
        // Cập nhật chỉ số sức khỏe bên cạnh
        document.getElementById('temperature').innerText = `${(36.5 + Math.random() * 1).toFixed(1)}°C`;
        document.getElementById('heartRate').innerText = `${Math.floor(Math.random() * 20) + 60} bpm`;
        document.getElementById('bloodPressure').innerText = `${Math.floor(Math.random() * 40) + 110}/${Math.floor(Math.random() * 20) + 70} mmHg`;
    }

    // Cập nhật dữ liệu mỗi giây
    setInterval(updateChart, 5000); // Cập nhật mỗi 5 giây
});
