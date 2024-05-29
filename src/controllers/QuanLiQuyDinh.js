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

const addGenre = async (req, res) => {
    try {
        const { tentheloai } = req.body;
        if (!tentheloai) {
            return res.status(400).json({
                success: false,
                message: "Missing input!"
            });
        }
        let rule = await QuyDinh.findOne({});
        if (!rule) {
            // Nếu không có quy định tồn tại, tạo một quy định mới và thêm thể loại vào danh sách
            rule = new QuyDinh({ DStheloai: [tentheloai] });
        } else {
            // Kiểm tra xem tên thể loại đã tồn tại trong danh sách hay chưa
            const existedIndex = rule.DStheloai.findIndex(item => item === tentheloai);
            if (existedIndex !== -1) {
                return res.status(400).json({
                    success: false,
                    message: "Tên thể loại đã tồn tại trong danh sách!"
                });
            }
            // Thêm tentheloai mới vào danh sách thể loại trong quy định
            rule.DStheloai.push(tentheloai);
        }
        // Lưu lại quy định sau khi thêm thể loại mới
        await rule.save();
        return res.status(200).json({
            success: true,
            message: "Thêm thể loại thành công!"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

const deleteGenre = async (req, res) => {
    try {
        const { tentheloai } = req.body;
        if (!tentheloai) {
            return res.status(400).json({
                success: false,
                message: "Missing input!"
            });
        }
        const rule = await QuyDinh.findOne({});
        if (!rule || !rule.DStheloai || rule.DStheloai.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Không có thể loại để xóa!"
            });
        }
        // Kiểm tra xem tentheloai có tồn tại trong danh sách thể loại không
        const index = rule.DStheloai.indexOf(tentheloai);
        if (index === -1) {
            return res.status(400).json({
                success: false,
                message: "Tên thể loại không tồn tại!"
            });
        }
        // Xóa tentheloai khỏi danh sách thể loại
        rule.DStheloai.splice(index, 1);
        // Lưu lại quy định sau khi xóa thể loại
        await rule.save();
        return res.status(200).json({
            success: true,
            message: "Xóa thể loại thành công!"
        });
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
    addGenre,
    deleteGenre,
    getBookBorrowReturnRule,
    updateBookBorrowReturnRule,
    updatePulishYearDistance,
}