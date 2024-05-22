const Rules = require("../models/QuyDinh")
const {calculateDate} = require("../helps/calculateTime")
const Books = require("../models/Sach")
const Author = require("../models/TacGia")

const createNewBook = async (req, res) => {
    const {tensach, theloai, tacgia, namxuatban, nhaxuatban, ngaynhap, trigia} = req.body;
    try {
        // Kiểm tra validate dữ liệu
        if (!tensach || !theloai || !tacgia || !namxuatban || !nhaxuatban || !ngaynhap || !trigia){
            return res.status(400).json({
                success: false,
                message: 'Missing input!'
            })
        }

        //Kiểm tra xem số lượng tác giả có thỏa mãn hay không
        const soluongtacgia = await Author.KiemTraSoLuongTacGia();
        if (soluongtacgia === -1 || soluongtacgia > 100){
            return res.status(400).json({
                success: false,
                message: 'Số lượng tác giả không đúng quy định!'
            })
        }

        // Tạo 1 mã sách mới
        const highestMaSachDoc = await Books.findOne({}).sort('-MaSach').exec();
        let highestMaSach = 0;
        if (highestMaSachDoc) {
            highestMaSach = parseInt(highestMaSachDoc.MaSach.substr(2)); 
        }
        const newBookID = 'MS' + String(highestMaSach + 1).padStart(5, '0'); 

        // Lấy quy định
        const rule = await Rules.findOne({});
        //Nếu có quy định
        if (rule !== null){
            const listTheLoai = rule.DStheloai;
            const khoangcachxb = rule.khoangcachxuatban;

            if (listTheLoai.length === 0 && khoangcachxb === Infinity){
                const newBook = await Books.create({
                    MaSach: newBookID,
                    tensach: tensach,
                    theloai: theloai,
                    tacgia: tacgia,
                    namxuatban: namxuatban,
                    nhaxuatban: nhaxuatban,
                    ngaynhap: new Date(ngaynhap),
                    gia: trigia
                })
            } else {
                // Kiểm tra thể loại có nằm trong danh sách thể loại hay không
                if (listTheloai.includes(theloai)) {
                    const newBook = await Books.create({
                        MaSach: newBookID,
                        tensach: tensach,
                        theloai: theloai,
                        tacgia: tacgia,
                        namxuatban: namxuatban,
                        nhaxuatban: nhaxuatban,
                        ngaynhap: new Date(ngaynhap),
                        gia: trigia
                    })
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Thể loại không nằm trong danh sách!'
                    })
                } 
                
                // Kiểm tra khoảng cách năm xuất bản
                if (calculateDate(namxuatban) <=  khoangcachxuatban ){
                    const newBook = await Books.create({
                        MaSach: newBookID,
                        tensach: tensach,
                        theloai: theloai,
                        tacgia: tacgia,
                        namxuatban: namxuatban,
                        nhaxuatban: nhaxuatban,
                        ngaynhap: new Date(ngaynhap),
                        gia: trigia
                    })
                }
                else {
                    return res.status(400).json({
                        success: false,
                        message: 'Khoảng cách năm xuất bản không đúng quy định!'
                    })
                }
            }

            const NgayLapThe = formatDate(newBook.ngaylapthe);
            return res.status(200).json({
                success: true,
                message: "Create Book successfully!",
                data: {
                    ...newBook,
                    ngaylapthe: NgayLapThe
                }
            });

        } // Ngược lại
        else {
            const newBook = await Books.create({
                MaSach: newBookID,
                tensach: tensach,
                theloai: theloai,
                tacgia: tacgia,
                namxuatban: namxuatban,
                nhaxuatban: nhaxuatban,
                ngaynhap: new Date(ngaynhap),
                gia: trigia
            })
            const NgayLapThe = formatDate(newBook.ngaylapthe);
            return res.status(200).json({
                success: true,
                message: "Create Book successfully!",
                data: {
                    ...newBook,
                    ngaylapthe: NgayLapThe
                }
            });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

const updateBook = async (req, res) => {
    
}

const deleteBook = async (req, res) => {
    try {
        
        const MaSach = req.query.MaSach;

        if (!MaSach) {
            return res.status(400).json({
                success: false,
                message: 'BookID is required from query!'
            });
        }
        const sach = await Books.findOneAndDelete({MaSach: MaSach}) ;
        if (!sach){
            return res.status(400).json({
                success: false,
                message: `Don't find book`
            })
        } 
        return res.status(200).json({
            success: true,
            message: 'Delete book successfully'
        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

const getAllBooks = async (req, res) => {
    try {
        const allBooks = await Books.find({});
        if (!allBooks){
            return res.status(400).json({
                success: false,
                message: 'No books!'
            })
        } else {
            const formattedBook = allBooks.map(book => {
                const formattedNgayNhap = formatDate(book.ngaynhap);
                return { ...book.toObject(), ngaynhap: formattedNgayNhap};
            });
            return res.status(200).json({
                success: true,
                data: formattedBook
            })
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

const findBookByName = async (req, res) => {
    try {
        const tensach = req.query.TenSach;

        if (!tensach) {
            return res.status(400).json({
                success: false,
                message: 'TenSach is required from query!'
            });
        }

        const book = await Books.findOne({tensach: tensach});
        if (!book){
            return res.status(400).json({
                success: false,
                message: `Don't' find book!`
            })
        }
        const formattedNgayNhap = formatDate(book.ngaynhap);
        return res.status(200).json({
            success: true,
            data: { ...book.toObject(), ngaynhap: formattedNgayNhap}
        })

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

const findBookByBookID = async (req, res) => {
    try {
        const BookID = req.query.MaSach;

        if (!BookID) {
            return res.status(400).json({
                success: false,
                message: 'BookID is required from query!'
            });
        }

        const book = await Books.findOne({MaSach: BookID});
        if (!book){
            return res.status(400).json({
                success: false,
                message: `Don't' find book!`
            })
        }
        const formattedNgayNhap = formatDate(book.ngaynhap);
        return res.status(200).json({
            success: true,
            data: { ...book.toObject(), ngaynhap: formattedNgayNhap}
        })

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

module.exports = {
    createNewBook,
    updateBook,
    deleteBook,
    getAllBooks,
    findBookByName,
    findBookByBookID
}