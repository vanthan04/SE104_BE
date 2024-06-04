const DocGia = require("../models/DocGia")
const QuyDinh = require("../models/QuyDinh")

const getReaderRule = async (req, res) => {
    try {
        const rule = await QuyDinh.findOne({});
        if (!rule || (!rule.tuoitoithieu && !rule.tuoitoida && !rule.giatrithe)){
            return res.status(400).json({
                success: false,
                message: "Không có quy định!" ,
                data: {}
            }) 
        } else {
            const data = {tuoitoithieu: rule.tuoitoithieu, tuoitoida: rule.tuoitoida, giatrithe: rule.giatrithe}
            return res.status(200).json({
                success: true,
                data: data
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

const updateReaderRule = async (req, res) => {
    try {
        const {tuoitoithieu, tuoitoida, giatrithe} = req.body;
        if (!tuoitoithieu || !tuoitoida || !giatrithe){
            return res.status(400).json({
                success: false,
                message: 'Missing input!'
            })
        }
        if (tuoitoithieu <= 0 || tuoitoida <= 0 || giatrithe <= 0 ){
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập số lớn hơn 0!'
            })
        }   
        if (tuoitoithieu >= tuoitoida ) {
            res.status(400).json({
                success: false,
                message: 'Tuổi tối thiểu không thể lớn hơn tuối tối đa!'
            })
        }
        const rule = await QuyDinh.findOne({});
        if (!rule){
            await QuyDinh.create({
                tuoitoithieu: tuoitoithieu,
                tuoitoida: tuoitoida,
                giatrithe: giatrithe
            })
            return res.status(200).json({
                success: true,
                message: "Cập nhật quy định thành công!"
            })
        }else{
            if (tuoitoida && tuoitoithieu && giatrithe && parseInt(tuoitoithieu) === rule.tuoitoithieu && parseInt(tuoitoida) === rule.tuoitoida && parseInt(giatrithe) === rule.giatrithe){
                return res.status(400).json({
                    success: false,
                    message: "Không có sự thay đổi!"
                })
            } else {
                await QuyDinh.updateOne(
                    {},
                    {
                        tuoitoithieu: tuoitoithieu,
                        tuoitoida: tuoitoida,
                        giatrithe: giatrithe
                    },
                    {new: true}
                )
                const docgias = await DocGia.find({});
                if (docgias !== null){
                    for (const docgia of docgias) {
                        await docgia.updateReader(parseInt(tuoitoithieu), parseInt(tuoitoida), parseInt(giatrithe));
                    }
                }

                return res.status(200).json({
                    success: true,
                    message: "Cập nhật quy định thành công!"
                })
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

const getBookRule = async (req, res) => {
    try {
        const rule = await QuyDinh.findOne({});
        if (!rule){
            return res.status(400).json({
                success: false,
                message: "Không có quy định!",
                data: {}
            }) 
        } else {
            const data = {theloai: rule.theloai, khoangcachxuatban: rule.khoangcachxuatban}
            return res.status(200).json({
                success: true,
                data: data
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

const getGenres = async (req, res) => {
    try {
        // Tìm kiếm rule trong cơ sở dữ liệu
        const rule = await QuyDinh.findOne({});
        if (!rule) {
            return res.status(404).json({
                success: false,
                message: "Rule not found!"
            });
        }

        // Lấy danh sách thể loại từ rule
        const genreNames = rule.DStheloai.map(item => item.tentheloai);
        console.log(genreNames)
        // Trả về danh sách tên thể loại
        return res.status(200).json({
            success: true,
            data: genreNames,
            message: "Lấy danh sách thể loại thành công!"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

const updateGenre = async (req, res) => {
    try {
        const { DSTheLoai } = req.body;
         // Kiểm tra nếu DSTheLoai không tồn tại hoặc là chuỗi rỗng hoặc là mảng rỗng
        if (!DSTheLoai || DSTheLoai.trim() === `""` || DSTheLoai.trim() === `"[]"`) {
            return res.status(400).json({
                success: false,
                message: "Thiếu dữ liệu!"
            });
        }
        const parsedDStheloai = JSON.parse(DSTheLoai);
        const cleanedString = parsedDStheloai.replace(/[\[\]]/g, '');
        const listTL = cleanedString.split(',');       
        const DStheloai = listTL.map(tentheloai => ({ tentheloai }));

        // Kiểm tra nếu DStheloai rỗng
        if (!DStheloai.length) {
            return res.status(400).json({
                success: false,
                message: "Thiếu dữ liệu!"
            });
        }

        const rule = await QuyDinh.findOne({});
        if (!rule) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy quy định!"
            });
        }
        // Loại bỏ trường _id khỏi danh sách trong DB và sắp xếp
        const dbDStheloai = rule.DStheloai.map(item => ({ tentheloai: item.tentheloai })).sort((a, b) => a.tentheloai.localeCompare(b.tentheloai));

        // Sắp xếp danh sách thể loại gửi lên
        const sortedDStheloai = DStheloai.sort((a, b) => a.tentheloai.localeCompare(b.tentheloai));
        const matched = JSON.stringify(dbDStheloai) === JSON.stringify(sortedDStheloai);
        if (matched) {
            return res.status(200).json({
                success: true,
                message: "Danh sách thể loại giống nhau!"
            });
        }
        else {
            await QuyDinh.updateOne(
                {},
                {
                    DStheloai: sortedDStheloai
                },
                {new: true}
            )
            return res.status(200).json({
                success: true,
                message: "Cập nhật thể loại thành công!"
            })    
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
};




const updatePulishYearDistance = async (req, res) => {
    try {
        const {khoangcachxuatban} = req.body;
        if (!khoangcachxuatban){
            return res.status(400).json({
                success: false,
                message: 'Missing input!'
            })
        }
        
        const rule = await QuyDinh.findOne({});
        if (!rule){
            await QuyDinh.create({
                khoangcachxuatban: khoangcachxuatban
            })
            return res.status(200).json({
                success: true,
                message: "Cập nhật quy định thành công!"
            })
        }else{
            if (khoangcachxuatban && parseInt(khoangcachxuatban) === rule.khoangcachxuatban){
                return res.status(400).json({
                    success: false,
                    message: "Không có sự thay đổi!"
                })
            } else {
                await QuyDinh.updateOne(
                    {},
                    {
                        khoangcachxuatban: khoangcachxuatban
                    },
                    {new: true}
                )
                const docgias = await DocGia.find({});
                if (docgias !== null){
                    for (const docgia of docgia) {
                        await docgia.updateReader(parseInt(tuoitoithieu), parseInt(tuoitoida), parseInt(giatrithe));
                    }
                }

                return res.status(200).json({
                    success: true,
                    message: "Cập nhật quy định thành công!"
                })
            }
        }

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}


const getBookBorrowReturnRule = async (req, res) => {
    try {
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

const updateBookBorrowReturnRule = async (req, res) => {
    try {
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}


module.exports = {
    getReaderRule,
    updateReaderRule,
    getBookRule,
    getGenres,
    updateGenre,
    getBookBorrowReturnRule,
    updateBookBorrowReturnRule,
    updatePulishYearDistance,
}