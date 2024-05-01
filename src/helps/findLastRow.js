const findLastRow = async (model) => {
    try {
        const count = await model.countDocuments({});
        if (count === 0){
            return null;
        } else {
            const latestRow = await model.findOne().sort({createdAt: -1});
            return latestRow; 
        }
    } catch (error) {
        throw error;
    }
}

module.exports = {findLastRow};
