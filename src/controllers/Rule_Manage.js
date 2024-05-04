const Rules = require("../models/Rules")
const Readers = require("../models/Readers")

const getReaderRules = async (req, res) => {
    try {
        const rule = await Rules.findOne({});
        if (rule === null){
            return res.status(400).json({
                success: false,
                message: "No rule!"
            }) 
        } else {
            const data = {minAge: rule.minAge, maxAge: rule.maxAge, cardValue: rule.cardValue}
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

const updateReaderRules = async (req, res) => {
    try {
        const {minAge, maxAge, cardValue} = req.body;
        if (!minAge || !maxAge || !cardValue){
            return res.status(400).json({
                success: false,
                message: 'Missing input!'
            })
        }
        const rule = await Rules.findOne({});
        if (rule === null){
            await Rules.create({
                minAge: minAge,
                maxAge: maxAge,
                cardValue: cardValue
            })
        }else{
            if (parseInt(minAge) === rule.minAge && parseInt(maxAge) === rule.maxAge && parseInt(cardValue) === rule.cardValue){
                return res.status(400).json({
                    success: false,
                    message: "No modify!"
                })
            } else {
                await Rules.updateOne(
                    {},
                    {
                        minAge: minAge,
                        maxAge: maxAge,
                        cardValue: cardValue
                    },
                    {new: true}
                )
                const readers = await Readers.find({});

                for (const reader of readers) {
                    await reader.updateReader(parseInt(minAge), parseInt(maxAge), parseInt(cardValue));
                }

                return res.status(200).json({
                    success: true,
                    message: "Update rule successfully"
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

const getBookRules = async (req, res) => {
    try {
        const rule = await Rules.findOne({});
        if (rule === null){
            return res.status(400).json({
                success: false,
                message: "No rule!"
            }) 
        } else {
            const data = {genres: rule.genres, Publishing_distance: rule.Publishing_distance}
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

const deleteGenres = async (req, res)=>{

}
const addGenres = async (req, res) => {

}


const updateBookRules = async (req, res) => {
    try {
        const {Genres, Publishing_distance} = req.body;
        if (!Genres || !Publishing_distance){
            return res.status(400).json({
                success: false,
                message: 'Missing input!'
            })
        }
        const listGenres = JSON.parse(Genres);
        const lastRow = await findLastRow(Book_Rules);
        if (lastRow && listGenres === lastRow.genres && parseInt(Publishing_distance) === lastRow.Publishing_distance){
            return res.status(400).json({
                success: false,
                message: 'No modify!'
            })
        }
        await Book_Rules.create({
            genres: listGenres,
            Publishing_distance: Publishing_distance
        })
        return res.status(200).json({
            success: true,
            message: "Update rule successfully!",
        })

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}


const getBookBorrowRules = async (req, res) => {
    try {
        const lastRow = await findLastRow(Book_Borrowing_Rules);
        if (lastRow === null){
            return res.status(400).json({
                success: false,
                data: null
            })
        } else {
            
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}

const updateBookBorrowRules = async (req, res) => {
    try {
        const {minAge, maxAge, cardValue} = req.body;
        if (!minAge || !maxAge || !cardValue){
            return res.status(400).json({
                success: false,
                message: 'Missing input!'
            })
        }
        const lastRow = await findLastRow(Reader_Rules);
        if (minAge === lastRow.minAge && maxAge === lastRow.maxAge && cardValue === lastRow.cardValue){
            return res.status(400).json({
                success: false,
                message: 'No modify!'
            })
        }
        const newRule = await Reader_Rules.create({
            minAge: minAge,
            maxAge: maxAge,
            cardValue: cardValue
        })
        return res.status(200).json({
            success: true,
            message: "Update rule successfully!",
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error!'
        })
    }
}


module.exports = {
    getReaderRules,
    updateReaderRules,
    getBookRules,
    updateBookRules,
    getBookBorrowRules,
    updateBookBorrowRules
}