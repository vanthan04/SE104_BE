const QuyDinh = require("../models/QuyDinh")
const {calculateDate} = require("../helps/calculateTime")
const Book = require("../models/Sach")
const { formatDatetoUpdate, formatDatetoShow } = require("../helps/fixDate")
const Sach = require("../models/Sach")
const MuonTraSach = require("../models/MuonTraSach")
const DocGia = require("../models/DocGia")

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
        const soluongtacgia = await Sach.countDistinctTacGia();
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
            

        // Lấy quy định
        const rule = await QuyDinh.findOne({});
        //Nếu có quy định
        if (rule !== null){
            const listTheLoai = rule.DStheloai;
            const transformedList = listTheLoai.map(item => item.tentheloai);
            const khoangcachxb = rule.khoangcachxuatban;

            const newBook = new Book({
                MaSach: newBookID,
                tensach: tensach,
                theloai: theloai,
                tacgia: tacgia,
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
            // const NgayNhaptoUpdate = formatDatetoUpdate(newBook.ngaynhap)
            return res.status(200).json({
                success: true,
                message: "Thêm sách mới thành công!",
                data: {
                    ...newBook.toObject(),
                    ngaynhaptoShow: NgayNhaptoShow,
                    // ngaynhaptoUpdate: NgayNhaptoUpdate

                }
            });
        } // Ngược lại không có quy định
        else {
            const newBook = await Book.create({
                MaSach: newBookID,
                tensach: tensach,
                theloai: theloai,
                tacgia: tacgia,
                namxuatban: namxuatban,
                nhaxuatban: nhaxuatban,
                ngaynhap: new Date(ngaynhap),
                gia: trigia
            })

            const NgayNhaptoShow = formatDatetoShow(newBook.ngaynhap);
            // const NgayNhaptoUpdate = formatDatetoUpdate(newBook.ngaynhap)
            return res.status(200).json({
                success: true,
                message: "Thêm sách mới thành công!",
                data: {
                    ...newBook.toObject(),
                    ngaynhaptoShow: NgayNhaptoShow,
                    // ngaynhaptoUpdate: NgayNhaptoUpdate

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

// const updateBook = async (req, res) => {
//     try {
//         const {MaSach, tensach, theloai, tacgia, namxuatban, nhaxuatban, ngaynhap, gia} = req.body;

//         const book = await Book.findOne({MaSach: MaSach});
//         if(!book){
//             return res.status(400).json({
//                 success: false,
//                 message: `Không tìm thấy sách cần cập nhật!`
//             })
//         }

//         const parsedDStacgia = JSON.parse(tacgia);
//         const listTacGia = parsedDStacgia.map(author => author.trim());

//         const sortedlistTacGia = listTacGia.sort((a, b) => a.localeCompare(b));


//         const listdbTacGia = await book.getListTacGia();

//         const sortedlistdbTacGia = listdbTacGia.sort((a, b) => a.localeCompare(b));


//         const matched = JSON.stringify(sortedlistdbTacGia) === JSON.stringify(sortedlistTacGia);

//         if (tensach === book.tensach && theloai === book.theloai && matched && parseInt(namxuatban) === book.namxuatban && nhaxuatban === book.nhaxuatban && (new Date(ngaynhap)).getTime() === book.ngaynhap.getTime() && parseInt(gia) === book.gia){
//             return res.status(400).json({
//                 success: false,
//                 message: 'Không có sự thay đổi!'
//             })
//         }

//         const rule = await QuyDinh.findOne({});
//         if (rule){
//             if (calculateDate(ngaynhap) < 0){
//                 return res.status(400).json({
//                     success: false,
//                     message: "Ngày nhập sách không hợp lệ!"
//                 });
//             }
//             const listTheLoai = rule.DStheloai;
//             const transformedList = listTheLoai.map(item => item.tentheloai);

//             if (!transformedList.includes(theloai)){
//                 return res.status(400).json({
//                     success: false,
//                     message: "Thể loại không nằm trong danh sách thể loại!"
//                 });
//             }

//         }

//         // Kiểm tra và thêm tác  giả nếu chưa tồn tại
//         const tacgiaIds = await Promise.all(listTacGia.map(async (tentacgia) => {
//             // listdbTacGia.map((tentacgia1) => {
//             //     if (tentacgia === tentacgia1) return;
//             // })
//             let author = await TacGia.findOne({ tentacgia });
//             if (!author) {
//                 author = await TacGia.create({ tentacgia });
//             }
//             return author._id;
//         }));

//         const updatebook = await Book.findOneAndUpdate(
//             {MaSach: MaSach},
//             {
//                 tensach: tensach,
//                 theloai: theloai,
//                 tacgia: tacgiaIds,
//                 namxuatban: namxuatban,
//                 nhaxuatban: nhaxuatban,
//                 ngaynhap: new Date(ngaynhap),
//                 gia: gia
//             },
//             {new: true}
//         )

        


//         const NgayNhaptoShow = formatDatetoShow(updatebook.ngaynhap);
//         const NgayNhaptoUpdate = formatDatetoUpdate(updatebook.ngaynhap)
//         // Trả về một đối tượng mới với ngày sinh đã được định dạng

//         return res.status(200).json({
//             success: true,
//             message: 'Cập nhật độc giả thành công!',
//             data: {
//                 ...updatebook.toObject(),
//                 ngaynhaptoShow: NgayNhaptoShow,
//                 ngaynhaptoUpdate: NgayNhaptoUpdate
//             }
//         })
//     } catch (error) {
//         console.log(error.message)
//         res.status(500).json({
//             success: false,
//             message: 'Internal Server Error!'
//         });
//     }
// }




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
        if (sach.tinhtrang === "Đã mượn"){
            return res.status(400).json({
                success: false,
                message: "Không thể xóa sách này vì đang có người mượn!"
            })
        }
        await Book.findOneAndDelete({MaSach: MaSach}) ;

        return res.status(200).json({
            success: true,
            message: 'Xóa sách thành công!'
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
        if (!allBooks || allBooks.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có sách nào!',
                data: []
            });
        }

        const formattedBooks = await Promise.all(allBooks.map(async (book) => {
            const NgayNhaptoShow = formatDatetoShow(book.ngaynhap);

            // Tìm bản ghi MuonTraSach có sách này trong mảng DanhSachMuon.sachmuon
            let borrowerInfo = null;
            if (book.tinhtrang === 'Đã mượn') {
                const nguoimuon = await DocGia.findById(book.docgiamuon)

                if (nguoimuon) {
                        borrowerInfo = {
                            MaDocGia: nguoimuon.MaDG,
                            HoTenDocGia: nguoimuon.hoten,
                            Email: nguoimuon.email,
                            NgaySinh: formatDatetoShow(nguoimuon.ngaysinh),
                            LoaiDocGia: nguoimuon.loaidocgia
                    }
                }
            }

            return {
                ...book.toObject(),
                ngaynhaptoShow: NgayNhaptoShow,
                borrowerInfo: borrowerInfo
            };
        }));

        return res.status(200).json({
            success: true,
            data: formattedBooks
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
};



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
                message: `Không tìm thấy sách!`
            })
        }
        const formattedBook = await Promise.all(allBooks.map( async (book) => {
            const NgayNhaptoShow = formatDatetoShow(book.ngaynhap);

            // Tìm bản ghi MuonTraSach có sách này trong mảng DanhSachMuon.sachmuon
            let borrowerInfo = null;
            if (book.tinhtrang === 'Đã mượn') {
                const nguoimuon = await DocGia.findById(book.docgiamuon)

                if (nguoimuon) {
                        borrowerInfo = {
                            MaDocGia: nguoimuon.MaDG,
                            HoTenDocGia: nguoimuon.hoten,
                            Email: nguoimuon.email,
                            NgaySinh: formatDatetoShow(nguoimuon.ngaysinh),
                            LoaiDocGia: nguoimuon.loaidocgia
                    }
                }
            }

            return {
                ...book.toObject(),
                ngaynhaptoShow: NgayNhaptoShow,
                borrowerInfo: borrowerInfo
            };

        }))

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
        // Tìm bản ghi MuonTraSach có sách này trong mảng DanhSachMuon.sachmuon
        let borrowerInfo = null;
        if (book.tinhtrang === 'Đã mượn') {
            const nguoimuon = await DocGia.findById(book.docgiamuon)

            if (nguoimuon) {
                    borrowerInfo = {
                        MaDocGia: nguoimuon.MaDG,
                        HoTenDocGia: nguoimuon.hoten,
                        Email: nguoimuon.email,
                        NgaySinh: formatDatetoShow(nguoimuon.ngaysinh),
                        LoaiDocGia: nguoimuon.loaidocgia
                }
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                ...book.toObject(),
                ngaynhaptoShow: NgayNhaptoShow,
                borrowerInfo: borrowerInfo
            }
        });

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
        console.log(theloai)
        if (!theloai){
            return res.status(400).json({
                success: false,
                message: 'Yêu cầu chọn thể loại để tìm kiếm!'
            })
        }
        const rule = await QuyDinh.findOne({});
        if (!rule){
            return res.status(400).json({
                success: false,
                message: 'Không có danh sách thể loại!'
            })
        }
        const listTheLoai = rule.DStheloai;
        const transformedList = listTheLoai.map(item => item.tentheloai);
        if (!transformedList.includes(theloai)){
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn thể loại trong danh sách thể loại!"
            })
        } 
        const listBooks = await Book.find({theloai: theloai});
        const formattedBook = await Promise.all(listBooks.map(async (book) => {
            const NgayNhaptoShow = formatDatetoShow(book.ngaynhap);

            // Tìm bản ghi MuonTraSach có sách này trong mảng DanhSachMuon.sachmuon
            let borrowerInfo = null;
            if (book.tinhtrang === 'Đã mượn') {
                const nguoimuon = await DocGia.findById(book.docgiamuon)

                if (nguoimuon) {
                        borrowerInfo = {
                            MaDocGia: nguoimuon.MaDG,
                            HoTenDocGia: nguoimuon.hoten,
                            Email: nguoimuon.email,
                            NgaySinh: formatDatetoShow(nguoimuon.ngaysinh),
                            LoaiDocGia: nguoimuon.loaidocgia
                    }
                }
            }

            return {
                ...book.toObject(),
                ngaynhaptoShow: NgayNhaptoShow,
                borrowerInfo: borrowerInfo
            };
    
        }))
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
    // updateBook,
    deleteBook,
    getAllBooks,
    findBookByName,
    findBookByBookID,
    findBookByGenre
}