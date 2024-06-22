const MuonTraSach = require("../models/MuonTraSach");
const DocGia = require("../models/DocGia")
const Sach = require("../models/Sach");
const { calculateDate } = require("../helps/calculateTime");
const QuyDinh = require("../models/QuyDinh");
const TienNo = require("../models/TienNo");
const { formatDatetoShow } = require("../helps/fixDate");

const MuonSach = async (req, res) => {
    try {
        const { hoten, NgayMuon, danhSachSach } = req.body;

        // Kiểm tra ngày mượn có hợp lệ hay không
        const rule = await QuyDinh.findOne({});
        if (calculateDate(NgayMuon) < 0) {
            return res.status(400).json({
                success: false,
                message: "Ngày mượn sách không hợp lệ!"
            });
        }

        // Tìm độc giả
        let docGia = await DocGia.findOne({ hoten: hoten });
        if (!docGia) {
            return res.status(400).json({
                success: false,
                message: 'Độc giả không tồn tại!'
            });
        }



        // Kiểm tra giá trị thẻ và hạn thẻ
        const giatrithe = rule.giatrithe;
        const isExpired = docGia.isCardExpired(giatrithe);
        if (isExpired) {
            return res.status(400).json({
                success: false,
                message: 'Thẻ độc giả đã hết hạn!'
            });
        }

        // Kiểm tra độc giả có sách mượn quá hạn không
        const ngaymuontoida = rule.songaymuontoida;
        const muonTraSach = await MuonTraSach.find({ ThongtinDocGia: docGia._id, 'DanhSachMuon.ngaytra': null });

        for (let muon of muonTraSach) {
            for (let sach of muon.DanhSachMuon) {
                const ngayTraQuyDinh = new Date(sach.ngaymuon);
                ngayTraQuyDinh.setDate(ngayTraQuyDinh.getDate() + ngaymuontoida);

                if (new Date() > ngayTraQuyDinh) {
                    return res.status(400).json({
                        success: false,
                        message: 'Độc giả có sách mượn quá hạn chưa trả!'
                    });
                }
            }
        }

        // Lấy số lượng sách mượn tối đa
        const soluongsachmuontoida = rule.soluongsachmuontoida;

        // Kiểm tra số sách đang mượn (sử dụng ngaytra === null để biết sách đã trả hay chưa)
        const soSachDangMuon = muonTraSach.reduce((total, muon) => {
            return total + muon.DanhSachMuon.filter(sach => sach.ngaytra === null).length;
        }, 0);

        if (soSachDangMuon + danhSachSach.length > soluongsachmuontoida) {
            return res.status(400).json({
                success: false,
                message: `Độc giả đang mượn ${soSachDangMuon} cuốn sách. Độc giả chỉ được mượn tối đa ${soluongsachmuontoida} quyển sách!`
            });
        }

        // Kiểm tra từng sách trong danh sách sách mượn
        let danhSachMuon = [];
        let ketQuaSach = [];
        for (let sach of danhSachSach) {
            let sachTimDuoc = await Sach.findOne({ MaSach: sach.MaSach });
            if (!sachTimDuoc) {
                ketQuaSach.push({
                    MaSach: sach.MaSach,
                    ketQua: 'không hợp lệ',
                    lyDo: 'Sách không tồn tại trong hệ thống'
                });
                continue;
            }
            if (sachTimDuoc.tinhtrang === 'Đã mượn') {
                ketQuaSach.push({
                    MaSach: sach.MaSach,
                    ketQua: 'không hợp lệ',
                    lyDo: 'Sách đang được mượn bởi người khác'
                });
                continue;
            }
            danhSachMuon.push({
                sachmuon: sachTimDuoc._id,
                ngaymuon: new Date(NgayMuon),
                ngaytra: null // chưa trả
            });

            sachTimDuoc.tinhtrang = 'Đã mượn';     
            sachTimDuoc.docgiamuon = docGia._id; // cập nhật người mượn
            await sachTimDuoc.save();

            ketQuaSach.push({
                MaSach: sach.MaSach,
                ketQua: 'hợp lệ',
                lyDo: ''
            });
        }

        const SachHopLe = ketQuaSach.filter(sach => sach.ketQua === 'hợp lệ');
        const SachKhongHopLe = ketQuaSach.filter(sach => sach.ketQua === 'không hợp lệ');

        if (SachHopLe.length > 0) {
            // Tìm bản ghi mượn trả sách hiện có của độc giả
            let muonTraSachHienCo = await MuonTraSach.findOne({ ThongtinDocGia: docGia._id });

            if (muonTraSachHienCo) {
                // Thêm danh sách sách mới vào danh sách mượn hiện tại
                muonTraSachHienCo.DanhSachMuon.push(...danhSachMuon);
                await muonTraSachHienCo.save();
            } else {
                // Tạo bản ghi mượn trả sách mới nếu không có bản ghi hiện tại
                let muonTraSachMoi = new MuonTraSach({
                    ThongtinDocGia: docGia._id,
                    DanhSachMuon: danhSachMuon
                });
                await muonTraSachMoi.save();
            }

            return res.status(200).json({
                success: true,
                message: 'Mượn sách thành công!',
                SachHopLe
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Có sách không hợp lệ trong danh sách mượn!',
                SachKhongHopLe
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
};





const TraSach = async (req, res) => {
    try {
        const { hoten, NgayTraThucTe, danhSachSach } = req.body;

        // Kiểm tra ngày trả hợp lệ
        const rule = await QuyDinh.findOne({});
        if (calculateDate(NgayTraThucTe) < 0) {
            return res.status(400).json({
                success: false,
                message: "Ngày trả sách không hợp lệ!" // Sai quy định ngày trả
            });
        }

        // Tìm DocGia
        let docGia = await DocGia.findOne({ hoten: hoten });
        if (!docGia) {
            return res.status(400).json({
                success: false,
                message: 'Độc giả không tồn tại!'
            });
        }

        // Tìm bản ghi mượn trả sách
        let muonTraSach = await MuonTraSach.findOne({ ThongtinDocGia: docGia._id }).populate('DanhSachMuon.sachmuon');
        if (!muonTraSach) {
            return res.status(400).json({
                success: false,
                message: 'Độc giả không có sách mượn!'
            });
        }

        // Lấy ngày mượn tối đa
        const ngaymuontoida = rule.songaymuontoida;

        let ketQuaTraSach = [];

        for (let sach of danhSachSach) {
            try {
                let sachTimDuoc = await Sach.findOne({ MaSach: sach.MaSach });
                if (!sachTimDuoc) {
                    ketQuaTraSach.push({
                        MaSach: sach.MaSach,
                        ketQua: 'không hợp lệ',
                        lyDo: 'Sách không tồn tại trong hệ thống'
                    });
                    continue;
                }

                let sachMuon = muonTraSach.DanhSachMuon.find(item => {
                    return item.sachmuon._id.toString() === sachTimDuoc._id.toString() && !item.ngaytra;
                });
                if (!sachMuon) {
                    ketQuaTraSach.push({
                        MaSach: sach.MaSach,
                        ketQua: 'không hợp lệ',
                        lyDo: 'Sách không được mượn bởi độc giả này hoặc đã được trả'
                    });
                    continue;
                }

                // Cập nhật ngày trả thực tế
                sachMuon.ngaytra = new Date(NgayTraThucTe);

                // Tính số ngày mượn
                const soNgayMuon = Math.ceil((new Date(sachMuon.ngaytra) - new Date(sachMuon.ngaymuon)) / (1000 * 60 * 60 * 24));

                // Ngày trả quy định
                const ngayTraQuyDinh = new Date(sachMuon.ngaymuon);
                ngayTraQuyDinh.setDate(ngayTraQuyDinh.getDate() + ngaymuontoida);
                // Kiểm tra quá hạn và tính tiền phạt
                const tienPhatMotNgay = rule.tienphatmoingay;
                
                let tienPhat = 0;
                let coSachQuaHan = false;
                if (new Date(sachMuon.ngaytra) > ngayTraQuyDinh) {
                    const soNgayQuaHan = Math.ceil((new Date(sachMuon.ngaytra) - ngayTraQuyDinh) / (1000 * 60 * 60 * 24));
                    tienPhat = soNgayQuaHan * tienPhatMotNgay;
                    coSachQuaHan = true;
                }

                // Nếu có sách quá hạn, lưu bản ghi tiền nợ
                if (coSachQuaHan) {
                    let tienNo = new TienNo({
                        ThongTinDocGia: docGia._id,
                        SachTra: sachMuon.sachmuon,
                        ngaytra: sachMuon.ngaytra,
                        ngaytraquydinh: ngayTraQuyDinh,
                        tienno: tienPhat
                    });
                    await tienNo.save();
                }

                // Cập nhật tình trạng sách
                sachTimDuoc.tinhtrang = 'Còn Trống';
                sachTimDuoc.docgiamuon = null; // cập nhật người mượn
                await sachTimDuoc.save();

                ketQuaTraSach.push({
                    MaSach: sach.MaSach,
                    ketQua: 'hợp lệ',
                    NgayMuon: sachMuon.ngaymuon,
                    NgayTraQuyDinh: ngayTraQuyDinh,
                    NgayTraThucTe: sachMuon.ngaytra,
                    SoNgayMuon: soNgayMuon,
                    TienPhat: tienPhat,
                    lyDo: ''
                });
            } catch (error) {
                console.log(error.message)
                ketQuaTraSach.push({
                    MaSach: sach.MaSach,
                    ketQua: 'không hợp lệ',
                    lyDo: 'Lỗi hệ thống'
                });
            }
        }

        // Tính tổng tiền phạt của kỳ này
        const tienPhatKyNay = ketQuaTraSach.reduce((total, sach) => total + (sach.TienPhat || 0), 0);

        muonTraSach.tienphatkynay = tienPhatKyNay;
        muonTraSach.tongphat = (muonTraSach.tongphat || 0) + tienPhatKyNay;

        docGia.tongno = (docGia.tongno + tienPhatKyNay);
        await docGia.save();
        await muonTraSach.save();

        // Kiểm tra số lượng sách hợp lệ
        const SachHopLe = ketQuaTraSach.filter(sach => sach.ketQua === 'hợp lệ');
        const SachKhongHopLe = ketQuaTraSach.filter(sach => sach.ketQua === 'không hợp lệ');
        if (SachHopLe.length === danhSachSach.length) {
            return res.status(200).json({
                success: true,
                message: 'Trả sách thành công!',
                data: {
                    hoten: docGia.hoten,
                    NgayTraThucTe: NgayTraThucTe,
                    tienPhatKyNay: tienPhatKyNay,
                    tongPhat: muonTraSach.tongphat,
                    SachHopLe: SachHopLe
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Có sách không hợp lệ trong danh sách trả!',
                NgayTraThucTe: NgayTraThucTe,
                tienPhatKyNay: tienPhatKyNay,
                tongPhat: docGia.tongno,
                SachHopLe: SachHopLe,
                SachKhongHopLe: SachKhongHopLe
            });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
};


const getListBookBorrowReturnByReaderID = async (req, res) => {
    try {
        const readerID = req.query.MaDG;

        // Kiểm tra readerID có hợp lệ không
        if (!readerID) {
            return res.status(400).json({
                success: false,
                message: 'readerID is required!'
            });
        }

        // Tìm độc giả
        let docGia = await DocGia.findOne({ MaDG: readerID });
        if (!docGia) {
            return res.status(404).json({
                success: false,
                message: 'Độc giả không tồn tại!'
            });
        }

        // Lấy danh sách sách mượn và trả của độc giả
        let muonTraSach = await MuonTraSach.find({ ThongtinDocGia: docGia._id }).populate('DanhSachMuon.sachmuon');

        // Xử lý dữ liệu để trả về kết quả
        let result = await Promise.all(muonTraSach.map(async muon => {
            let danhSachSach = await Promise.all(muon.DanhSachMuon.map(async sach => {
                const ngayMuon = new Date(sach.ngaymuon);
                const ngayTra = sach.ngaytra ? new Date(sach.ngaytra) : null;
                let soNgayMuon = null;
                if (ngayTra){
                    soNgayMuon = Math.ceil((ngayTra - ngayMuon) / (1000 * 60 * 60 * 24));
                }

                // Tìm thông tin tiền phạt cho sách này
                let sachPhat = await TienNo.findOne({ 'ThongTinDocGia': docGia._id, 'SachTra': sach.sachmuon });
                const tienPhat = sachPhat ? sachPhat.tienno : 0;

                // Populate thêm thông tin tên sách
                let thongTinSach = await Sach.findById(sach.sachmuon).select('MaSach tensach');

                return {
                    MaSach: thongTinSach.MaSach,
                    TenSach: thongTinSach.tensach,
                    NgayMuon: formatDatetoShow(ngayMuon),
                    NgayTra: ngayTra ? formatDatetoShow(ngayTra) : null,
                    SoNgayMuon: soNgayMuon,
                    TienPhat: tienPhat
                };
            }));

            return {
                MaDocGia: docGia.MaDG,
                HoTenDocGia: docGia.hoten,
                TongNo: docGia.tongno,
                DanhSachSach: danhSachSach
            };
        }));

        // Trả về kết quả
        return res.status(200).json({
            success: true,
            data: result
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
    MuonSach,
    TraSach,
    getListBookBorrowReturnByReaderID
}