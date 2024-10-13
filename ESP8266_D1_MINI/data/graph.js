// var chartB = new Highcharts.Chart({
//   // tạo biểu đồ
//   chart: { renderTo: "chart-body" }, //renderTo: là ID của html
//   title: { text: "Nhiệt độ cơ thể" },
//   series: [
//     {
//       showInLegend: true, // chuỗi này không được hiển thị trên legend
//       data: [], // data sẽ được thêm khi khởi tạo biểu đồ
//       name: "Nhiệt độ cơ thể"
//     },
//     {
//       showInLegend: true, // Hiển thị trong chú thích
//       data: [], // Dữ liệu cho series mới
//       name: "Nhiệt độ môi trường", // Tên của series mới
//       color: "#FF5733" // Màu của series mới
//     }
//   ],
//   plotOptions: {
//     line: { animation: false, dataLabels: { enabled: true } },
//     series: { color: "#059e8a" }, // cấu hình chung cho các chuỗi
//   },
//   xAxis: { type: "datetime", dateTimeLabelFormats: { second: "%H:%M:%S" } },
//   yAxis: {
//     title: { text: "Temperature (Body)" },
//     //title: { text: 'Temperature (Fahrenheit)' }
//   },
//   credits: { enabled: false }, // tắt hiển thị bản quyền
// });
// setInterval(function () {
//   // dùng để thực thi 1 hàm hay 1 code trong thời gian nhất định
//   var xhttp = new XMLHttpRequest(); // request lên server để nhận phản hồi
//   xhttp.onreadystatechange = function () {
//     // hàm này sẽ được gọi khi trạng thái http thay đổi
//     if (this.readyState == 4 && this.status == 200) {
//       // đã nhận được response từ server
//       var x = new Date().getTime(),
//         y = parseFloat(this.responseText);
//       // cập nhật data cho nhiệt độ cơ thể
//       if (chartB.series[0].data.length >=10) {
//         // cho phép từ 10 mẫu thử hiển thị
//         chartB.series[0].addPoint([x, y], true, true, true); // nếu đúng biểu đồ sẽ thêm data mới và xóa cái cũ nhất
//       } else {
//         chartB.series[0].addPoint([x, y], true, false, true); // nếu sai thì sẽ thêm nhưng không xóa
//       }
//       // cập nhật data cho nhiệt độ môi trường
//       y2=y;
//       if (chartB.series[1].data.length >=10) {
//         // phải >40 ký tự mới xét
//         chartB.series[1].addPoint([x, y2], true, true, true); // nếu đúng biểu đồ sẽ thêm data mới và xóa cái cũ nhất
//       } else {
//         chartB.series[1].addPoint([x, y2], true, false, true); // nếu sai thì sẽ thêm nhưng không xóa
//       }
//     }
//   };
//   xhttp.open("GET", "/body", true); // phương thức trong http dùng để yêu cầu nhận dữ liệu từ server
//   xhttp.send(); // gửi data lên server
// }, 1000);

var chartB = new Highcharts.Chart({
  chart: { renderTo: "chart-body" },
  title: { text: "Nhiệt độ cơ thể" },
  series: [
    {
      showInLegend: false,
      data: [],
    },
  ],
  plotOptions: {
    line: { animation: false, dataLabels: { enabled: true } },
  },
  xAxis: {
    type: "datetime",
    dateTimeLabelFormats: { second: "%H:%M:%S" },
  },
  yAxis: {
    title: { text: "Temperature (Ambient)" },
  },
  credits: { enabled: false },
});
setInterval(function () {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var x = new Date().getTime(),
        y = parseFloat(this.responseText);
      //console.log(this.responseText);
      if (chartB.series[0].data.length >=10) {
        chartB.series[0].addPoint([x, y], true, true, true);
      } else {
        chartB.series[0].addPoint([x, y], true, false, true);
      }
    }
  };
  xhttp.open("GET", "/body", true);
  xhttp.send();
}, 1000);

var chartA = new Highcharts.Chart({
  chart: { renderTo: "chart-ambient" },
  title: { text: "Nhiệt độ môi trường" },
  series: [
    {
      showInLegend: false,
      data: [],
    },
  ],
  plotOptions: {
    line: { animation: false, dataLabels: { enabled: true } },
  },
  xAxis: {
    type: "datetime",
    dateTimeLabelFormats: { second: "%H:%M:%S" },
  },
  yAxis: {
    title: { text: "Temperature (Ambient)" },
  },
  credits: { enabled: false },
});
setInterval(function () {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var x = new Date().getTime(),
        y = parseFloat(this.responseText);
      //console.log(this.responseText);
      if (chartA.series[0].data.length >=10) {
        chartA.series[0].addPoint([x, y], true, true, true);
      } else {
        chartA.series[0].addPoint([x, y], true, false, true);
      }
    }
  };
  xhttp.open("GET", "/ambient", true);
  xhttp.send();
}, 1000);