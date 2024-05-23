const DocGia = require("../models/DocGia")
const QuyDinh = require("../models/QuyDinh")
const {calculateDate} = require("../helps/calculateTime")
const {formatDatetoShow, formatDatetoUpdate} = require("../helps/fixDate")

const createNewReader = async (req, res) => {
    try {
        const {hoten, email, loaidocgia, ngaysinh, diachi, ngaylapthe} = req.body;
        console.log(req.body);
        // Kiểm tra validated dữ liệu
        if (!hoten || !ngaysinh || !diachi || !email || !loaidocgia || !ngaylapthe){
            return res.status(400).json({
                success: false,
                message: "Thiếu dữ liệu!"
            });
        }

        // Kiểm tra email tồn tại hay chưa
        const isExistEmail = await DocGia.findOne({email: email});
        if (isExistEmail){
            return res.status(400).json({
                success: false,
                message: "Email đã tồn tại!"
            });
        }

        //Tạo 1 mã độc giả mới
        const highestMaDGDoc = await DocGia.findOne({}).sort('-MaDG').exec();
        let highestMaDG = 0;
        if (highestMaDGDoc) {
            highestMaDG = parseInt(highestMaDGDoc.MaDG.substr(2)); 
        }
        const newreaderID = 'DG' + String(highestMaDG + 1).padStart(5, '0'); 

        // Kiểm tra dữ liệu gửi lên có thỏa quy định hay không
        const rule = await QuyDinh.findOne({});
        // Nếu có quy định 
        if (rule !== null){
            //Kiểm tra hợp lệ của ngày sinh
            if (calculateDate(ngaysinh) < 0 || calculateDate(ngaysinh) < rule.tuoitoithieu || calculateDate(ngaysinh) > rule.tuoitoida){
                return res.status(400).json({
                    success: false,
                    message: "Sai quy định độ tuổi. Vui lòng xem quy định!" // Sai quy định tuổi
                });
            } else {
                // Kiểm tra hợp lệ của giá trị thẻ
                if (calculateDate(ngaylapthe) <= 0 || calculateDate(ngaylapthe) > (rule.giatrithe/12) || calculateDate(ngaylapthe) < 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Sai quy định giá trị thẻ. Vui lòng xem quy định!" // Sai quy định giá trị thẻ
                    });
                } else {
                    const newReader = await DocGia.create({
                        MaDG: newreaderID,
                        hoten: hoten,
                        ngaysinh: new Date(ngaysinh),
                        diachi: diachi,
                        email: email,
                        loaidocgia: loaidocgia,
                        ngaylapthe: new Date(ngaylapthe)
                    });
                    // NgaySinh = formatDatetoUpdate(newReader.ngaysinh);
                    // NgayLapThe = formatDatetoUpdate(newReader.ngaylapthe);
                    return res.status(200).json({
                        success: true,
                        message: "Tạo mới độc giả thành công!",
                        // data: {
                        //     ...data,
                        //     ngaysinh: NgaySinh,
                        //     ngaylapthe: NgayLapThe
                        // }
                    });
                }   
            }
        // Ngược lại ko có quy định
        } else {
            if (calculateDate(ngaysinh) < 0 ){
                return res.status(400).json({
                    success: false,
                    message: "Sai quy định giá trị thẻ. Vui lòng xem quy định!" // Sai quy định tuổi
                });
            } else {
                // Kiểm tra hợp lệ của giá trị thẻ
                if (calculateDate(ngaylapthe) <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Sai quy định giá trị thẻ. Vui lòng xem quy định!" // Sai quy định giá trị thẻ
                    })
                }
            }
            const newReader = await DocGia.create({
                MaDG: newreaderID,
                hoten: hoten,
                ngaysinh: new Date(ngaysinh),
                diachi: diachi,
                email: email,
                loaidocgia: loaidocgia,
                ngaylapthe: new Date(ngaylapthe)
            });
            // const {password, refreshToken, ...data} = newReader.toObject(); 
            // NgaySinh = formatDatetoUpdate(newReader.ngaysinh);
            // NgayLapThe = formatDatetoUpdate(newReader.ngaylapthe);
            return res.status(200).json({
                success: true,
                message: "Tạo mới độc giả thành công!",
                // data: {
                //     ...data,
                //     ngaysinh: NgaySinh,
                //     ngaylapthe: NgayLapThe
                // }
            });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
};


const updateReader = async (req, res) => {
    try {
        const {MaDG, hoten, ngaysinh, diachi, email, loaidocgia, ngaylapthe} = req.body;
        const reader = await DocGia.findOne({MaDG: MaDG});
        if(!reader || reader.isDelete){
            return res.status(400).json({
                success: false,
                message: `Không tìm thấy độc giả!`
            })
        }

        if (hoten === reader.hoten && (new Date(ngaysinh)).getTime() === reader.ngaysinh.getTime() && diachi === reader.diachi && email === reader.email && loaidocgia === reader.loaidocgia && (new Date(ngaylapthe)).getTime() === reader.ngaylapthe.getTime()){
            return res.status(400).json({
                success: false,
                message: 'Không có sự thay đổi!'
            })
        }

        if (rule){
            if (calculateDate(ngaysinh) < 0 || calculateDate(ngaysinh) < rule.tuoitoithieu || calculateDate(ngaysinh) > rule.tuoitoida){
                return res.status(400).json({
                    success: false,
                    message: "Sai quy định độ tuổi. Vui lòng xem quy định!" // Sai quy định tuổi
                });
            } else {
                // Kiểm tra hợp lệ của giá trị thẻ
                if (calculateDate(ngaylapthe) <= 0 || calculateDate(ngaylapthe) > (rule.giatrithe/12) || calculateDate(ngaylapthe) < 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Sai quy định giá trị thẻ. Vui lòng xem quy định!" // Sai quy định giá trị thẻ
                    });
                }
            }

            await updatereader.updateReader(rule.tuoitoithieu, rule.tuoitoida, rule.giatrithe)
        }
        const updatereader = await DocGia.findOneAndUpdate(
            {MaDG: MaDG},
            {
                hoten: hoten,
                ngaysinh: new Date(ngaysinh),
                diachi: diachi,
                email: email,
                loaidocgia: loaidocgia,
                ngaylapthe: new Date(ngaylapthe)
            },
            {new: true}
        )
        const rule = await QuyDinh.findOne({});

        const formattedtoUpdateNgaysinh = formatDatetoUpdate(ngaysinh);
        const formattedtoUpdateNgayLapThe = formatDatetoUpdate(ngaylapthe)
        const formattedtoShowNgaysinh = formatDatetoShow(ngaysinh);
        const formattedtoShowNgayLapThe = formatDatetoShow(ngaylapthe);

        // Trả về một đối tượng mới với ngày sinh đã được định dạng

        return res.status(200).json({
            success: true,
            message: 'Cập nhật độc giả thành công!',
            data: {
                ...updatereader.toObject(),
                ngaysinhtoUpdate: formattedtoUpdateNgaysinh,
                ngaylapthetoUpdate: formattedtoUpdateNgayLapThe,
                ngaysinhtoShow: formattedtoShowNgaysinh,
                ngaylapthetoShow: formattedtoShowNgayLapThe
            }
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
}
const deleteReader = async (req, res) => {
    try {
        const MaDG = req.query.MaDG;
        if (!MaDG) {
            return res.status(400).json({
                success: false,
                message: 'Chọn mã độc giả để xóa!'
            });
        }
        // Cập nhật biến isDelete bằng true với độc giả bị xóa
        const docgia = await DocGia.findOneAndUpdate(
            {MaDG: MaDG},
            {isDelete: true},
            {new: true}
        
        );

        if (!docgia || docgia.isDelete){
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy độc giả!'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Xóa độc giả thành công!'
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
}

const getAllReaders = async (req, res) => {
    try {
        const allreader = await DocGia.find({});

        if (allreader === null){
            return res.status(400).json({
                success: false,
                message: 'Không có độc giả!',
                data: []
            })
        } else {
            const formattedReaders = allreader.map(reader => {
                // Chuyển đổi ngày sinh từ đối tượng Date sang chuỗi có định dạng "DD-MM-YYYY"
                const formattedtoUpdateNgaysinh = formatDatetoUpdate(reader.ngaysinh);
                const formattedtoUpdateNgayLapThe = formatDatetoUpdate(reader.ngaylapthe)
                const formattedtoShowNgaysinh = formatDatetoShow(reader.ngaysinh);
                const formattedtoShowNgayLapThe = formatDatetoShow(reader.ngaylapthe);
                // Trả về một đối tượng mới với ngày sinh đã được định dạng
                if (!reader.isDelete){
                    return {
                        ...reader.toObject(),
                        ngaysinhtoUpdate: formattedtoUpdateNgaysinh,
                        ngaylapthetoUpdate: formattedtoUpdateNgayLapThe,
                        ngaysinhtoShow: formattedtoShowNgaysinh,
                        ngaylapthetoShow: formattedtoShowNgayLapThe
                    };
                }
            });

            return res.status(200).json({
                success: true,
                data: formattedReaders
            });
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
}


const findReaderByMaDG = async (req, res) => {
    try {
        const MaDG = req.query.MaDG;

        if (!MaDG) {
            return res.status(400).json({
                success: false,
                message: 'Yêu cầu nhập mã độc giả!'
            });
        }
        const reader = await DocGia.findOne({ MaDG: MaDG });
        if (!reader || reader.isDelete) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy độc giả!',
                data: []
            });
        } else {
            const formattedtoUpdateNgaysinh = formatDatetoUpdate(reader.ngaysinh);
            const formattedtoUpdateNgayLapThe = formatDatetoUpdate(reader.ngaylapthe)
            const formattedtoShowNgaysinh = formatDatetoShow(reader.ngaysinh);
            const formattedtoShowNgayLapThe = formatDatetoShow(reader.ngaylapthe);
            return res.status(200).json({
                success: true,
                data: {
                    ...reader.toObject(),
                    ngaysinhtoShow: formattedtoShowNgaysinh, 
                    ngaylapthetoShow: formattedtoShowNgayLapThe,
                    ngaysinhtoUpdate: formattedtoUpdateNgaysinh,
                    ngaylapthetoUpdate: formattedtoUpdateNgayLapThe
                }
            });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
};

const findReaderByFullname = async (req, res) => {
    try {
        const hoten = req.query.hoten;

        if (!hoten) {
            return res.status(400).json({
                success: false,
                message: 'Yêu cầu nhập họ và tên độc giả để tìm kiếm!'
            });
        }

        let count = 0;
        const readers = await DocGia.find({ hoten: hoten });
        if (!readers || readers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy độc giả!',
                data: []
            });
        } else {
            
            const formattedReaders = readers.map(reader => {
                const formattedtoUpdateNgaysinh = formatDatetoUpdate(reader.ngaysinh);
                const formattedtoUpdateNgayLapThe = formatDatetoUpdate(reader.ngaylapthe)
                const formattedtoShowNgaysinh = formatDatetoShow(reader.ngaysinh);
                const formattedtoShowNgayLapThe = formatDatetoShow(reader.ngaylapthe);
                if (!reader.isDelete){
                    return { 
                        ...reader.toObject(),
                        ngaysinhtoShow: formattedtoShowNgaysinh, 
                        ngaylapthetoShow: formattedtoShowNgayLapThe,
                        ngaysinhtoUpdate: formattedtoUpdateNgaysinh,
                        ngaylapthetoUpdate: formattedtoUpdateNgayLapThe
                    };
                }
                else{
                    count += 1
                }
            });
            
            //Kiểm tra số lượng độc giả đã xóa có bằng số lượng độc giả tìm thấy hay không
            if (count === readers.length){
                return res.status(400).json({
                    success: false,
                    message: 'Không tìm thấy độc giả!',
                    data: []
                });
            }
            return res.status(200).json({
                success: true,
                data: formattedReaders
            });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
};

const findReaderByEmail = async (req, res) => {
    try {
        const email = req.query.email;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Yêu cầu nhập email để tìm kiếm!'
            });
        }

        const reader = await DocGia.findOne({ email: email });
        if (!reader || reader.isDelete) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy độc giả!',
                listdata: []
            });
        } else {
            const formattedtoUpdateNgaysinh = formatDatetoUpdate(reader.ngaysinh);
            const formattedtoUpdateNgayLapThe = formatDatetoUpdate(reader.ngaylapthe)
            const formattedtoShowNgaysinh = formatDatetoShow(reader.ngaysinh);
            const formattedtoShowNgayLapThe = formatDatetoShow(reader.ngaylapthe);
            return res.status(200).json({
                success: true,
                data: {
                    ...reader.toObject(),
                    ngaysinhtoShow: formattedtoShowNgaysinh, 
                    ngaylapthetoShow: formattedtoShowNgayLapThe,
                    ngaysinhtoUpdate: formattedtoUpdateNgaysinh,
                    ngaylapthetoUpdate: formattedtoUpdateNgayLapThe
                }
            });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
};
module.exports = {
    createNewReader,
    updateReader,
    deleteReader,
    getAllReaders,
    findReaderByMaDG,
    findReaderByFullname,
    findReaderByEmail
}