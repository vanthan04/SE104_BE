const mongoose = require("mongoose")

const AuthorSchema = new mongoose.Schema(
    {
        authorName:{
            type: String
        }
    },
    {
        timestamps: true
    }
)

TacGiaSchema.methods = {
    CheckTheNumberOfAuthors: async function(){
        try {
            await TacGiaSchema.distinct('authorName', (err, uniqueNames) => {
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

module.exports = mongoose.model("Author", AuthorSchema)