const Rules = require("../models/QuyDinh")
const {calculateDate} = require("../helps/calculateTime")
const Books = require("../models/Sach")
const Author = require("../model/TacGia")

const createNewBook = async (req, res) => {
    const {tensach, theloai, tacgia, namxuatban, nhaxuatban, ngaynhap, trigia} = req.body;
    try {
        if (!tensach || !theloai || !tacgia || !namxuatban || !nhaxuatban || !ngaynhap || !trigia){
            return res.status(400).json({
                success: false,
                message: 'Missing input!'
            })
        }
        const soluongtacgia = await Author.KiemTraSoLuongTacGia();
        if (soluongtacgia === -1 || soluongtacgia > 100){
            return res.status(400).json({
                success: false,
                message: 'Số lượng tác giả không đúng quy định!'
            })
        }
        const rule = await Rules.findOne({});
        if (rule !== null){
            
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

const getAllBooks = async (req, res) => {

}


module.exports = {
    createNewBook,

}