const Readers = require("../models/Readers")
const Rules = require("../models/Rules")
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
        const isExistEmail = await Readers.findOne({email: email})
        if (isExistEmail){
            return res.status(400).json({
                sucess: false,
                message: "Email has existed!"
            })
        }

        //Tạo 1 mã độc giả mới
        const highestMaDGDoc = await Readers.findOne({}).sort('-readerID').exec();
        let highestMaDG = 0;
        if (highestMaDGDoc) {
            highestMaDG = parseInt(highestMaDGDoc.readerID.substr(2)); 
        }
        const newreaderID = 'DG' + String(highestMaDG + 1).padStart(5, '0'); 


        // Kiểm tra dữ liệu gửi lên có thỏa quy định hay không
        const rule = await Rules.findOne({})
        // Nếu có quy định 
        if (rule !== null){
            //Kiểm tra hợp lệ của ngày sinh
            if (calculateDate(dateofbirth) < rule.minAge || calculateDate(dateofbirth) > rule.maxAge){
                return res.status(400).json({
                    success: false,
                    message: "Wrong age rule" // Sai quy định tuổi
                });
            } else {
                // Kiểm tra hợp lệ của giá trị thẻ
                if (calculateDate(CardIssuanceDate) > (rule.cardValue/12) || calculateDate(CardIssuanceDate) < 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Wrong card value rule" // Sai quy định giá trị thẻ
                    })
                } else {
                    const newReader = await Readers.create({
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
            const newReader = await Readers.create({
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
            message: 'Internal Server Error!'
        });
    }
}
const updateReader = async (req, res) => {
    try {
        const {readerID, fullname, dateofbirth, address, email, typeofread, CardIssuanceDate} = req.body;
        const reader = await Readers.findOne({readerID: readerID});
        if(!reader){
            return res.status(400).json({
                success: false,
                message: `Don't find reader`
            })
        }

        if (fullname === reader.fullname && (new Date(dateofbirth)).getTime() === reader.dateofbirth.getTime() && address === reader.address && email === reader.email && typeofread === reader.typeofReader && (new Date(CardIssuanceDate)).getTime() === reader.CardIssuanceDate.getTime()){
            return res.status(400).json({
                success: false,
                message: 'No modify!'
            })
        }
        const updatereader = await Readers.findOneAndUpdate(
            {readerID: readerID},
            {
                fullname: fullname,
                dateofbirth: new Date(dateofbirth),
                address: address,
                email: email,
                typeofReader: typeofread,
                CardIssuanceDate: new Date(CardIssuanceDate)
            },
            {new: true}
        )
        const rule = await Rules.findOne({});
        if (rule){
            await updatereader.updateReader(rule.minAge, rule.maxAge, rule.cardValue)
        }
        const {refreshToken, password, ...data} = updatereader.toObject();
        return res.status(200).json({
            success: true,
            message: 'Update Reader successfully!',
            data: data
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
        const readerID = req.query.readerID;
        const deleteReader = await Readers.findOneAndDelete({readerID: readerID});
        if (!deleteReader){
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
        const allreader = await Readers.find({}).select('-refreshToken -password');
        if (allreader === null){
            return res.status(400).json({
                success: false,
                message: 'No readers!'
            })
        } else {
            return res.status(200).json({
                success: true,
                data: allreader
            })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
}


const findReaderByReaderID = async (req, res) => {
    try {
        const readerID = req.query.readerID;
        console.log(readerID)
        const reader = await Readers.findOne({readerID: readerID}).select('-refreshToken -password');
        if (!reader){
            return res.status(400).json({
                success: false,
                message: `Don't find reader`
            })
        } else {
            return res.status(200).json({
                success: true,
                data: reader
            })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
    
}

const findReaderByFullname = async (req, res) => {
    try {
        const fullname = req.query.fullname;
        const reader = await Readers.find({fullname: fullname}).select('-refreshToken -password');
        if (!reader){
            return res.status(400).json({
                success: false,
                message: `Don't find reader`
            })
        } else {
            return res.status(200).json({
                success: true,
                data: reader
            })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
    
}

const findReaderByEmail = async (req, res) => {
    try {
        const email = req.query.email;
        const reader = await Readers.findOne({email: email}).select('-refreshToken -password');
        if (!reader){
            return res.status(400).json({
                success: false,
                message: `Don't find reader`
            })
        } else {
            return res.status(200).json({
                success: true,
                data: reader
            })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        });
    }
   
}
module.exports = {
    createNewReader,
    updateReader,
    deleteReader,
    getAllReaders,
    findReaderByReaderID,
    findReaderByFullname,
    findReaderByEmail
}