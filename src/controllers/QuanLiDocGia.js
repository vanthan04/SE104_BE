const DocGia = require("../models/DocGia")
const QuyDinh = require("../models/QuyDinh")
const {calculateDate} = require("../helps/calculateTime")
const {formatDate} = require("../helps/fixDate")

const createNewReader = async (req, res) => {
    let NgaySinh, NgayLapThe; // Khai báo biến NgaySinh và NgayLapThe ở đầu hàm
    try {
        const {hoten, email, loaidocgia, ngaysinh, diachi, ngaylapthe} = req.body;
        console.log(req.body);
        // Kiểm tra validated dữ liệu
        if (!hoten || !ngaysinh || !diachi || !email || !loaidocgia || !ngaylapthe){
            return res.status(400).json({
                success: false,
                message: "Missing inputs!"
            });
        }

        // Kiểm tra email tồn tại hay chưa
        const isExistEmail = await DocGia.findOne({email: email});
        if (isExistEmail){
            return res.status(400).json({
                success: false,
                message: "Email has existed!"
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
                    message: "Wrong age rule" // Sai quy định tuổi
                });
            } else {
                // Kiểm tra hợp lệ của giá trị thẻ
                if (calculateDate(ngaylapthe) <= 0 || calculateDate(ngaylapthe) > (rule.giatrithe/12) || calculateDate(ngaylapthe) < 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Wrong card value rule" // Sai quy định giá trị thẻ
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
                    console.log(newReader);
                    const {password, refreshToken, ...data} = newReader.toObject();  
                    NgaySinh = formatDate(newReader.ngaysinh);
                    NgayLapThe = formatDate(newReader.ngaylapthe);
                    return res.status(200).json({
                        success: true,
                        message: "Create reader successfully!",
                        data: {
                            ...data,
                            ngaysinh: NgaySinh,
                            ngaylapthe: NgayLapThe
                        }
                    });
                }   
            }
        // Ngược lại ko có quy định
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
            const {password, refreshToken, ...data} = newReader.toObject(); 
            NgaySinh = formatDate(newReader.ngaysinh);
            NgayLapThe = formatDate(newReader.ngaylapthe);
            return res.status(200).json({
                success: true,
                message: "Create reader successfully!",
                data: {
                    ...data,
                    ngaysinh: NgaySinh,
                    ngaylapthe: NgayLapThe
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


const updateReader = async (req, res) => {
    try {
        const {MaDG, hoten, ngaysinh, diachi, email, loaidocgia, ngaylapthe} = req.body;
        const reader = await DocGia.findOne({MaDG: MaDG});
        if(!reader){
            return res.status(400).json({
                success: false,
                message: `Don't find reader!`
            })
        }

        if (hoten === reader.hoten && (new Date(ngaysinh)).getTime() === reader.ngaysinh.getTime() && diachi === reader.diachi && email === reader.email && loaidocgia === reader.loaidocgia && (new Date(ngaylapthe)).getTime() === reader.ngaylapthe.getTime()){
            return res.status(400).json({
                success: false,
                message: 'No modify!'
            })
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
        if (rule){
            await updatereader.updateReader(rule.tuoitoithieu, rule.tuoitoida, rule.giatrithe)
        }
        let {refreshToken, password, NgaySinh, NgayLapThe, ...data} = updatereader.toObject();
        NgaySinh = formatDate(NgaySinh);
        NgayLapThe = formatDate(NgayLapThe)
        return res.status(200).json({
            success: true,
            message: 'Update Reader successfully!',
            data: {
                ...data,
                ngaysinh: NgaySinh,
                ngaylapthe: NgayLapThe
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
        const docgia = await DocGia.findOneAndDelete({MaDG: MaDG});
        if (!docgia){
            return res.status(400).json({
                success: false,
                message: `Don't find reader`
            })
        }
        return res.status(200).json({
            success: true,
            message: 'Delete reader successfully!'
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
        const allreader = await DocGia.find({}).select('-refreshToken -password');

        if (allreader === null){

            return res.status(400).json({
                success: false,
                message: 'No readers!'
            })
        } else {
            const formattedReaders = allreader.map(reader => {
                // Chuyển đổi ngày sinh từ đối tượng Date sang chuỗi có định dạng "DD-MM-YYYY"
                const formattedNgaysinh = formatDate(reader.ngaysinh);
                const formattedNgayLapThe = formatDate(reader.ngaylapthe)
                // Trả về một đối tượng mới với ngày sinh đã được định dạng
                return {
                    ...reader.toObject(),
                    ngaysinh: formattedNgaysinh,
                    ngaylapthe: formattedNgayLapThe
                };
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
        const reader = await DocGia.findOne({ MaDG: MaDG }).select('-refreshToken -password');
        if (!reader) {
            return res.status(400).json({
                success: false,
                message: `Don't find reader`
            });
        } else {
            const formattedNgaysinh = formatDate(reader.ngaysinh);
            const formattedNgaylapthe = formatDate(reader.ngaylapthe);
            return res.status(200).json({
                success: true,
                data: { ...reader.toObject(), ngaysinh: formattedNgaysinh, ngaylapthe: formattedNgaylapthe }
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
        const readers = await DocGia.find({ hoten: hoten }).select('-refreshToken -password');
        if (!readers || readers.length === 0) {
            return res.status(400).json({
                success: false,
                message: `Don't find reader`
            });
        } else {
            const formattedReaders = readers.map(reader => {
                const formattedNgaysinh = formatDate(reader.ngaysinh);
                const formattedNgaylapthe = formatDate(reader.ngaylapthe);
                return { ...reader.toObject(), ngaysinh: formattedNgaysinh, ngaylapthe: formattedNgaylapthe };
            });
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
        const reader = await DocGia.findOne({ email: email }).select('-refreshToken -password');
        if (!reader) {
            return res.status(400).json({
                success: false,
                message: `Don't find reader`
            });
        } else {
            const formattedNgaysinh = formatDate(reader.ngaysinh);
            const formattedNgaylapthe = formatDate(reader.ngaylapthe);
            return res.status(200).json({
                success: true,
                data: { ...reader.toObject(), ngaysinh: formattedNgaysinh, ngaylapthe: formattedNgaylapthe }
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