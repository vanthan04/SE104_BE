const Rules = require("../models/QuyDinh")
const {calculateDate} = require("../helps/calculateTime")
const Book = require("../models/Sach")
const TacGia = require("../models/TacGia")
const { formatDatetoUpdate, formatDatetoShow } = require("../helps/fixDate")

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


        if (calculateDate(ngaynhap) < 0){
            return res.status(400).json({
                success: false,
                message: "Ngày nhập không hợp lệ!"
            })
        }
        const date = new Date();
        if (namxuatban > date.getFullYear) {
            return res.status.json({
                success: false,
                message: "Năm xuất bản không hợp lệ!"
            })
        }

        //Kiểm tra xem số lượng tác giả có thỏa mãn hay không
        const soluongtacgia = await new TacGia().KiemTraSoLuongTacGia();
        if (soluongtacgia === -1 || soluongtacgia > 100){
            return res.status(400).json({
                success: false,
                message: 'Số lượng tác giả không đúng quy định!'
            })
        }

        // Tạo 1 mã sách mới
        const highestMaSachDoc = await Book.findOne({}).sort('-MaSach').exec();
        let highestMaSach = 0;
        if (highestMaSachDoc) {
            highestMaSach = parseInt(highestMaSachDoc.MaSach.substr(2)); 
        }
        const newBookID = 'MS' + String(highestMaSach + 1).padStart(5, '0'); 

        const parsedDStacgia = JSON.parse(tacgia);
        const listTL = parsedDStacgia.split(','); 

        // Kiểm tra và thêm tác  giả nếu chưa tồn tại
        const tacgiaIds = await Promise.all(listTL.map(async (tentacgia) => {
            let author = await TacGia.findOne({ tentacgia });
            if (!author) {
                author = await TacGia.create({ tentacgia });
            }
            return author._id;
        }));

        // Lấy quy định
        const rule = await Rules.findOne({});
        //Nếu có quy định
        if (rule !== null){
            const listTheLoai = rule.DStheloai;
            const transformedList = listTheLoai.map(item => item.tentheloai);
            const khoangcachxb = rule.khoangcachxuatban;

            const newBook = new Book({
                MaSach: newBookID,
                tensach: tensach,
                theloai: theloai,
                tacgia: tacgiaIds,
                namxuatban: namxuatban,
                nhaxuatban: nhaxuatban,
                ngaynhap: new Date(ngaynhap),
                gia: trigia
            })

            if (transformedList.length === 0){
                return res.status(400).json({
                    success: false,
                    message: "Thể loại không nằm trong danh sách!"
                })
            } else {
                // Kiểm tra thể loại có nằm trong danh sách thể loại hay không
                if (!transformedList.includes(theloai)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Thể loại không nằm trong danh sách!'
                    })
                } 
                // Kiểm tra khoảng cách năm xuất bản
                if (calculateDate(namxuatban) >  khoangcachxb ) {
                    return res.status(400).json({
                        success: false,
                        message: 'Khoảng cách năm xuất bản không đúng quy định. Vui lòng xem quy định!'
                    })
                }
            }
            await newBook.save();

            const NgayNhaptoShow = formatDatetoShow(newBook.ngaynhap);
            const NgayNhaptoUpdate = formatDatetoUpdate(newBook.ngaynhap)
            return res.status(200).json({
                success: true,
                message: "Thêm sách mới thành công!",
                data: {
                    ...newBook.toObject(),
                    ngaynhaptoShow: NgayNhaptoShow,
                    ngaynhaptoUpdate: NgayNhaptoUpdate

                }
            });
        } // Ngược lại
        else {
            const newBook = await Book.create({
                MaSach: newBookID,
                tensach: tensach,
                theloai: theloai,
                tacgia: tacgiaIds,
                namxuatban: namxuatban,
                nhaxuatban: nhaxuatban,
                ngaynhap: new Date(ngaynhap),
                gia: trigia
            })

            const NgayNhaptoShow = formatDatetoShow(newBook.ngaynhap);
            const NgayNhaptoUpdate = formatDatetoUpdate(newBook.ngaynhap)
            return res.status(200).json({
                success: true,
                message: "Thêm sách mới thành công!",
                data: {
                    ...newBook.toObject(),
                    ngaynhaptoShow: NgayNhaptoShow,
                    ngaynhaptoUpdate: NgayNhaptoUpdate

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
    try {
        const {MaSach, tensach, theloai, tacgia, namxuatban, nhaxuatban, ngaynhap, trigia} = req.body;

        const book = await Book.findOne({MaSach: MaSach});
        if(!book){
            return res.status(400).json({
                success: false,
                message: `Không tìm thấy sách cần cập nhật!`
            })
        }

        if (tensach === book.tensach && theloai === book.theloai && tacgia === book.tacgia && namxuatban === book.namxuatban && nhaxuatban === book.nhaxuatban && (new Date(ngaynhap)).getTime() === book.ngaynhap.getTime() && trigia === book.trigia){
            return res.status(400).json({
                success: false,
                message: 'Không có sự thay đổi!'
            })
        }

        if (tentacgia !== book.tentacgia) await TacGia.findOneAndUpdate({tentacgia: tentacgia})
        const rule = await QuyDinh.findOne({});
        if (rule){
            const listBooks = rule.DStheloai;
            if (calculateDate(ngaynhap) < 0){
                return res.status(400).json({
                    success: false,
                    message: "Ngày nhập sách không hợp lệ!"
                });
            }
            if (!listBooks.includes(theloai)){
                return res.status(400).json({
                    success: false,
                    message: "Thể loại không nằm trong danh sách thể loại!"
                });
            }

        }

        const updatebook = await Book.findOneAndUpdate(
            {MaSach: MaSach},
            {
                tensach: tensach,
                theloai: theloai,
                tacgia: tacgia,
                namxuatban: namxuatban,
                nhaxuatban: nhaxuatban,
                ngaynhap: new Date(ngaynhap),
                gia: trigia
            },
            {new: true}
        )

        


        const NgayNhaptoShow = formatDatetoShow(updatebook.ngaynhap);
        const NgayNhaptoUpdate = formatDatetoUpdate(updatebook.ngaynhap)
        // Trả về một đối tượng mới với ngày sinh đã được định dạng

        return res.status(200).json({
            success: true,
            message: 'Cập nhật độc giả thành công!',
            data: {
                ...updatereader.toObject(),
                ngaynhaptoShow: NgayNhaptoShow,
                ngaynhaptoUpdate: NgayNhaptoUpdate
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

const deleteBook = async (req, res) => {
    try {
        
        const MaSach = req.query.MaSach;

        if (!MaSach) {
            return res.status(400).json({
                success: false,
                message: 'Yêu cầu nhập vào mã sách!'
            });
        }
        const sach = await Book.findOne({MaSach: MaSach});
        if (!sach){
            return res.status(400).json({
                success: false,
                message: `Không tìm thấy sách trong danh sách!`
            })
        } 
        await Book.findOneAndDelete({MaSach: MaSach}) ;

        return res.status(200).json({
            success: true,
            message: 'Xóa sách thành công'
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
        const allBooks = await Book.find({});
        if (!allBooks){
            return res.status(400).json({
                success: false,
                message: 'Không có sách nào!',
                data: []
            })
        } else {
            const formattedBook = allBooks.map(book => {
                const NgayNhaptoShow = formatDatetoShow(book.ngaynhap);
                const ngaynhaptoUpdate = formatDatetoUpdate(book.ngaynhap);
                return { ...book.toObject(), ngaynhaptoShow: NgayNhaptoShow, ngaynhaptoUpdate: ngaynhaptoUpdate};
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
                message: 'Yêu cầu nhập tên sách để tìm kiếm!'
            });
        }
        const regex = new RegExp(tensach, 'i');
        const allBooks = await Book.find({ tensach: regex });

        if (!allBooks){
            return res.status(400).json({
                success: false,
                message: `Don't' find book!`
            })
        }
        const formattedBook = allBooks.map(book => {
            const NgayNhaptoShow = formatDatetoShow(book.ngaynhap);
            const ngaynhaptoUpdate = formatDatetoUpdate(book.ngaynhap)
            return { ...book.toObject(), ngaynhaptoShow: NgayNhaptoShow, ngaynhaptoUpdate: ngaynhaptoUpdate};

        })

        return res.status(200).json({
            success: true,
            data: formattedBook
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
                message: 'Yêu cầu nhập mã sách để tìm kiếm!'
            });
        }

        const book = await Book.findOne({MaSach: BookID});
        if (!book){
            return res.status(400).json({
                success: false,
                message: `Không tìm thấy sách!`,
                data: {}
            })
        }
        const NgayNhaptoShow = formatDatetoShow(book.ngaynhap);
        const ngaynhaptoUpdate = formatDatetoUpdate(book.ngaynhap)
        return res.status(200).json({
            success: true,
            data: { ...book.toObject(), ngaynhaptoShow: NgayNhaptoShow, ngaynhaptoUpdate: ngaynhaptoUpdate}
        })

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

const findBookByGenre = async (req, res) => {
    try {
        const theloai = req.query.theloai;
        if (!theloai){
            return res.status(400).json({
                success: false,
                message: 'Yêu cầu chọn thể loại để tìm kiếm!'
            })
        }
        const rule = await Rules.findOne({});
        if (!rule){
            return res.status(400).json({
                success: false,
                message: 'Không có danh sách thể loại!'
            })
        }
        const listGenre = rule.DStheloai;
        if (!listGenre.includes(theloai)){
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn thể loại trong danh sách thể loại!"
            })
        } 
        const listBooks = await Book.find({theloai: theloai});
        const formattedBook = listBooks.map(book => {
            const NgayNhaptoShow = formatDatetoShow(book.ngaynhap);
            const ngaynhaptoUpdate = formatDatetoUpdate(book.ngaynhap)
            return { ...book.toObject(), ngaynhaptoShow: NgayNhaptoShow, ngaynhaptoUpdate: ngaynhaptoUpdate};
    
        })
    
        return res.status(200).json({
            success: true,
            data: formattedBook
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
    findBookByBookID,
    findBookByGenre
}