const PhieuThu = require('../models/PhieuThu');
const DocGia = require('../models/DocGia'); // Import model DocGia để truy xuất thông tin độc giả
const { formatDatetoShow } = require('../helps/fixDate');
const { calculateDate } = require("../helps/calculateTime")

const PhieuThuTienPhat = async (req, res) => {
    try {
        const { MaDG, tienthu, ngaythu } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!MaDG || !tienthu || !ngaythu) {
            return res.status(400).json({
                success: false,
                message: 'Mã độc giả , tiền thu và ngày thu là bắt buộc!'
            });
        }


        // Kiểm tra ngày mượn có hợp lệ hay không
        if (calculateDate(ngaythu) < 0) {
            return res.status(400).json({
                success: false,
                message: "Ngày mượn sách không hợp lệ!" // Sai quy định ngày mượn
            });
        }

        // Kiểm tra xem độc giả có tồn tại không
        const docGia = await DocGia.findOne({ MaDG: MaDG });
        if (!docGia) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy độc giả!'
            });
        }
        if (tienthu > docGia.tongno) {
            return res.status(400).json({
                success: false,
                message: 'Tiền thu không thể lớn hơn tiền nợ!'
            })
        }

        // Tạo phiếu thu mới
        const phieuThu = new PhieuThu({
            MaDG: docGia._id,
            tiennohientai: docGia.tongno, // Cập nhật tiền nợ hiện tại của độc giả
            tienthu: tienthu,
            ngaythu: new Date(ngaythu)
        });

        // Lưu phiếu thu vào cơ sở dữ liệu
        await phieuThu.save();

        // Cập nhật lại tiền nợ của độc giả
        docGia.tongno -= tienthu;
        await docGia.save();

        return res.status(200).json({
            success: true,
            data: {
                MaDG: MaDG,
                ...phieuThu.toObject(),
                ngaythutoShow: formatDatetoShow(new Date(ngaythu))
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

const getCollectionListByReaderID = async (req, res) => {
    try {
        const readerID = req.query.MaDG;

        // Kiểm tra xem readerID có tồn tại không
        if (!readerID) {
            return res.status(400).json({
                success: false,
                message: 'Mã độc giả là bắt buộc!'
            });
        }

        // Tìm thông tin của độc giả
        const docGia = await DocGia.findOne({ MaDG: readerID });
        if (!docGia) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy độc giả!'
            });
        }

        // Lấy danh sách các bản ghi PhieuThu của độc giả
        const collectionList = await PhieuThu.find({ MaDG: docGia._id }).sort({ createdAt: -1 }); // Sắp xếp theo ngày trả tăng dần

        return res.status(200).json({
            success: true,
            data: {
                MaDG: docGia.MaDG,
                HoTen: docGia.hoten,
                email: docGia.email,
                ngaysinh: formatDatetoShow(new Date(docGia.ngaysinh)),
                collectionList
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
    PhieuThuTienPhat,
    getCollectionListByReaderID
};
