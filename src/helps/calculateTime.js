
const calculateDate = (age) => {
    const startDate = new Date(age);
    const endDate = new Date(); 

    // Tính số mili giây giữa hai ngày
    const millisecondsDiff = endDate - startDate;

    // Chuyển đổi số mili giây thành số năm
    const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25; // Số mili giây trong một năm (tính gần đúng)
    const yearsDiff = millisecondsDiff / millisecondsInYear;
    return yearsDiff;
};

module.exports = {calculateDate}