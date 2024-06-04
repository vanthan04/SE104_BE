const mongoose = require("mongoose");

const TacGiaSchema = new mongoose.Schema(
    {
        tentacgia: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

TacGiaSchema.methods = {
    KiemTraSoLuongTacGia: async function() {
        try {
            const uniqueNames = await this.model('TacGia').distinct('tentacgia').exec();
            const count = uniqueNames.length;
            return count;
        } catch (error) {
            console.error(error);
            return -1;
        }
    }
};

module.exports = mongoose.model("TacGia", TacGiaSchema);
