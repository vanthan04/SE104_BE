const moment = require('moment');
const Sach = require("../models/Sach")
const MuonTraSach = require("../models/MuonTraSach")

// Hàm lấy tổng số sách theo thể loại
const getTotalBooksByCategory = async () => {
    const totalBooks = await Sach.aggregate([
        { $group: { _id: '$theloai', count: { $sum: 1 } } }
    ]);

    let result = {};
    totalBooks.forEach(book => {
        result[book._id] = book.count;
    });

    return result;
};

const BaoCaoThongKeTinhHinhMuonSachTheoThangVaTheLoai = async (req, res) => {
    try {
        const { month, year } = req.body;

        // Kiểm tra tháng có hợp lệ không
        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Tháng và năm là bắt buộc!'
            });
        }

        // Lấy tổng số sách theo thể loại
        const totalBooksByCategory = await getTotalBooksByCategory();

        // Tạo ngày bắt đầu và ngày kết thúc của tháng được chọn
        const startOfMonth = new Date(year, month - 1, 1); // Tháng trong JavaScript đếm từ 0
        const endOfMonth = new Date(year, month, 0);

        // Lấy tất cả các bản ghi mượn trả sách trong khoảng thời gian được chọn
        let muonTraSachList = await MuonTraSach.find({
            'DanhSachMuon.ngaymuon': {
                $gte: startOfMonth,
                $lt: endOfMonth
            }
        }).populate('DanhSachMuon.sachmuon');

        let tongSoLuotMuon = 0;
        let thongKe = {};

        // Duyệt qua từng bản ghi mượn trả sách để đếm số lượng theo tháng và thể loại
        for (let muonTra of muonTraSachList) {
            for (let sachMuon of muonTra.DanhSachMuon) {
                // Lấy thông tin sách mượn từ ID của sách
                let sach = await Sach.findById(sachMuon.sachmuon);

                if (!thongKe[sach.theloai]) {
                    thongKe[sach.theloai] = {
                        soLuotMuon: 0,
                        tongSoSach: totalBooksByCategory[sach.theloai] || 1 // Tổng số sách của thể loại, tránh chia cho 0
                    };
                }

                thongKe[sach.theloai].soLuotMuon++;
                tongSoLuotMuon++;
            }
        }

       // Tính tỉ lệ cho từng thể loại
       let thongKeTheoTheLoai = [];
       for (let theLoai in thongKe) {
           let soLuotMuon = thongKe[theLoai].soLuotMuon;
           thongKeTheoTheLoai.push({
               tenTheLoai: theLoai,
               soLuotMuon: soLuotMuon,
               tiLe: ((soLuotMuon / tongSoLuotMuon) * 100).toFixed(2) + '%'
           });
       }

        // Trả về kết quả
        return res.status(200).json({
            success: true,
            data: {
                thongKeTheoTheLoai,
                tongSoLuotMuon
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
};




module.exports = {
    BaoCaoThongKeTinhHinhMuonSachTheoThangVaTheLoai
}