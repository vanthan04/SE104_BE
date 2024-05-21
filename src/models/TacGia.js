const mongoose = require("mongoose")

const TacGiaSchema = new mongoose.Schema(
    {
        tentacgia:{
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
            await TacGiaSchema.distinct('tentacgia', (err, uniqueNames) => {
                if (err) {
                    console.error(err);
                    return -1;
                }
                const count = uniqueNames.length;
                return count;
            });
        } catch (error) {
           console.log(error);
           return -1;
        }
        
    }
}

module.exports = mongoose.model("TacGia", TacGiaSchema)