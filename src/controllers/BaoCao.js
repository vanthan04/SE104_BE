const { parse } = require('json2csv');
const Sach = require("../models/Sach")
const MuonTraSach = require("../models/MuonTraSach");
const QuyDinh = require('../models/QuyDinh');
const TienNo = require("../models/TienNo");
const { formatDatetoShow } = require('../helps/fixDate');

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
        const { month, year } = req.query;

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

                if (sach && sach.theloai) { // Kiểm tra nếu sach và sach.theloai tồn tại
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

const DownLoadDSMuonSachTheoThangVaTheLoai = async (req, res) => {
    try {
        const { month, year } = req.query;

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

                if (sach && sach.theloai) { // Kiểm tra nếu sach và sach.theloai tồn tại
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
        
        // Thêm hàng tổng số lượt mượn
        thongKeTheoTheLoai.push({
            tenTheLoai: 'Tổng số lượt mượn',
            soLuotMuon: tongSoLuotMuon,
            tiLe: '100%'
        });


        // Tạo CSV từ kết quả thống kê với tiêu đề tiếng Việt
        const fields = [
            { label: 'Thể loại', value: 'tenTheLoai' },
            { label: 'Số lượt mượn', value: 'soLuotMuon' },
            { label: 'Tỉ lệ', value: 'tiLe' }
        ];
        const csv = parse(thongKeTheoTheLoai, { fields, withBOM: true });

        // Chuẩn bị tên file
        const fileName = `Báo cáo sách mượn tháng ${month}-${year}.csv`;

        // Set headers for CSV download
        res.header('Content-Type', 'text/csv; charset=utf-8');
        // res.header('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);

        return res.status(200).send(csv);


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
};



const getLateReturnBooksReport = async (req, res) => {
    try {
        const { ngaybaocao } = req.query; // Assume the date is sent from the client
        // Check if the date is valid
        if (!ngaybaocao) {
            return res.status(400).json({
                success: false,
                message: 'Ngày tháng năm là bắt buộc!'
            });
        }

        const parsedNgayTra = new Date(ngaybaocao);

        const rule = await QuyDinh.findOne({});

        // Get the list of late return records where ngaytra matches parsedNgayTra
        const lateReturns = await TienNo.find({
            ngaytra: parsedNgayTra
        }).populate({
            path: 'ThongTinDocGia',
            select: 'MaDG hoten',
        }).populate({
            path: 'SachTra',
            model: 'Sach',
            select: 'MaSach tensach'
        });

        // Calculate days borrowed and days overdue
        let report = lateReturns.map(item => {
            // Ensure ThongTinDocGia exists before accessing its properties
            const docGia = item.ThongTinDocGia ? {
                MaDG: item.ThongTinDocGia.MaDG,
                hoten: item.ThongTinDocGia.hoten
            } : {
                MaDG: 'N/A',
                hoten: 'Unknown'
            };

            return {
                MaDG: docGia.MaDG,
                hoten: docGia.hoten,
                MaSach: item.SachTra ? item.SachTra.MaSach : 'N/A',
                tensach: item.SachTra ? item.SachTra.tensach : 'Unknown',
                NgayMuon: formatDatetoShow(new Date((new Date(item.ngaytraquydinh)).getTime() - rule.songaymuontoida * 24 * 60 * 60 * 1000)),
                SoNgayTraTre: (item.ngaytra.getTime() - item.ngaytraquydinh.getTime()) / (1000 * 60 * 60 * 24)
            };
        });

        return res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
};


const DownLoadLateReturnBooksReport = async (req, res) => {
    try {
        const { ngaybaocao } = req.query;

        // Validate the input date
        if (!ngaybaocao) {
            return res.status(400).json({
                success: false,
                message: 'Ngày tháng năm là bắt buộc!'
            });
        }

        const parsedNgayTra = new Date(ngaybaocao);
        const formattedNgayTra = formatDatetoShow(parsedNgayTra);

        // Fetch the rule from QuyDinh collection
        const rule = await QuyDinh.findOne({});
        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy quy định!'
            });
        }

        // Retrieve late return records matching the input date
        const lateReturns = await TienNo.find({
            ngaytra: parsedNgayTra
        }).populate({
            path: 'ThongTinDocGia',
            select: 'MaDG hoten'
        }).populate({
            path: 'SachTra',
            model: 'Sach',
            select: 'MaSach tensach'
        });

        // Prepare data for CSV report
        let report = lateReturns.map(item => {
            const docGia = item.ThongTinDocGia || { MaDG: 'N/A', hoten: 'Unknown' };
            const sachTra = item.SachTra || { MaSach: 'N/A', tensach: 'Unknown' };

            const ngayMuon = new Date(item.ngaytraquydinh.getTime() - rule.songaymuontoida * 24 * 60 * 60 * 1000);
            const soNgayTraTre = (parsedNgayTra.getTime() - item.ngaytraquydinh.getTime()) / (1000 * 60 * 60 * 24);

            return {
                'Mã Độc Giả': docGia.MaDG,
                'Họ Tên': docGia.hoten,
                'Mã Sách': sachTra.MaSach,
                'Tên Sách': sachTra.tensach,
                'Ngày Mượn': formatDatetoShow(ngayMuon),
                'Số Ngày Trả Trễ': soNgayTraTre
            };
        });

        // Convert report data to CSV format
        const fields = ['Mã Độc Giả', 'Họ Tên', 'Mã Sách', 'Tên Sách', 'Ngày Mượn', 'Số Ngày Trả Trễ'];
        const csv = parse(report, { fields });

        // Send CSV file to client
        res.header('Content-Type', 'text/csv');
        // res.attachment(`Báo cáo sách trả trễ ngày ${formattedNgayTra}.csv`);
        return res.status(200).send(csv);

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
};

module.exports = {
    BaoCaoThongKeTinhHinhMuonSachTheoThangVaTheLoai,
    DownLoadDSMuonSachTheoThangVaTheLoai,
    getLateReturnBooksReport,
    DownLoadLateReturnBooksReport
}