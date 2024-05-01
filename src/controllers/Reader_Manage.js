const Reader = require("../models/Readers")
const Reader_Rules = require("../models/Reader_Rules")
const {findLastRow} = require("../helps/findLastRow")
const {calculateDate} = require("../helps/calculateTime")

const createNewReader = async (req, res) => {
    try {
        const {fullname, dateofbirth, address, email, typeofread, CardIssuanceDate} = req.body;

        //Kiểm tra validated dữ liệu
        if (!fullname || !dateofbirth || !address || !email || !typeofread || !CardIssuanceDate){
            return res.status(400).json({
                success: false,
                message: "Missing inputs!"
            });
        }

        // Kiểm tra email tồn tại hay chưa
        const isExistEmail = await Reader.findOne({email: email})
        if (isExistEmail){
            return res.status(400).json({
                sucess: false,
                message: "Email has existed!"
            })
        }

        //Tạo 1 mã độc giả mới
        const highestMaDGDoc = await Reader.findOne({}).sort('-readerID').exec();
        let highestMaDG = 0;
        if (highestMaDGDoc) {
            highestMaDG = parseInt(highestMaDGDoc.readerID.substr(2)); 
        }
        const newreaderID = 'DG' + String(highestMaDG + 1).padStart(5, '0'); 


        // Kiểm tra dữ liệu gửi lên có thỏa quy định hay không
        const rule = findLastRow(Reader_Rules);
        // Nếu có quy định 
        if (rule !== null){
            //Kiểm tra hợp lệ của ngày sinh
            if (calculateDate(dateofbirth) < rule.minAge || calculateDate(dateofbirth) > rule.maxAge){
                return res.status(400).json({
                    sucess: false,
                    message: "Wrong age rule" // Sai quy định tuổi
                });
            } else {
                // Kiểm tra hợp lệ của giá trị thẻ
                if (calculateDate(CardIssuanceDate) > (rule.cardValue/12) || calculateDate(CardIssuanceDate) < 0) {
                    return res.status(400).json({
                        sucess: false,
                        message: "Wrong card value rule" // Sai quy định giá trị thẻ
                    })
                } else {
                    const newReader = await Reader.create({
                        readerID: newreaderID,
                        fullname: fullname,
                        dateofbirth: new Date(dateofbirth),
                        address: address,
                        email: email,
                        typeofReader: typeofread,
                        CardIssuanceDate: new Date(CardIssuanceDate)
                    })
                    const {password, refreshToken, ...data} = newReader.toObject();  
                    return res.status(200).json({
                        success: true,
                        message: "Create reader successfully!",
                        data: data
                    })
                }   
            }
        // Ngược lại ko có quy định
        } else {
            const newReader = await Reader.create({
                readerID: newreaderID,
                fullname: fullname,
                dateofbirth: new Date(dateofbirth),
                address: address,
                email: email,
                typeofReader: typeofread,
                CardIssuanceDate: new Date(CardIssuanceDate)
            })
            const {password, refreshToken, ...data} = newReader.toObject(); 
            return res.status(200).json({
                success: true,
                message: "Create reader successfully!",
                data: data
            })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
}



module.exports = {createNewReader}