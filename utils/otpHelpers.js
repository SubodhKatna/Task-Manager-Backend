const generateOTP = () => {
    const x = Math.random();
    const fourDigitDecimalNumber = x * 9000 + 1000;
    const fourDigitNumber = Math.floor(fourDigitDecimalNumber);
    return fourDigitNumber;

    // return Math.floor(Math.random() * 9000 + 1000);
};

module.exports = {
    generateOTP,
};
