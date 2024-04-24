const mongoose = require("mongoose")

const TacGiaSchema = new mongoose.Schema(
    {
        TenTacGia:{
            type: String
        }
    },
    {
        timestamps: true
    }
)

TacGiaSchema.methods = {
    KiemTraSoLuongTacGia: async function(){
        try {
            await TacGiaSchema.distinct('TenTacGia', (err, uniqueNames) => {
                if (err) {
                    console.error(err);
                    return;
                }
                const count = uniqueNames.length;
                return count;
            });
        } catch (error) {
           console.log(error) 
        }
        
    }
}

module.exports = mongoose.model("TacGia", TacGiaSchema)