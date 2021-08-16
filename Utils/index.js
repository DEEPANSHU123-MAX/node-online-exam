const checkZero = (digit) => {
  if (String(digit).length < 2) {
    return "0" + digit;
  }
  return digit;
};

const formatDateForInput = (date) => {
  let newDateFormat =
    date.getFullYear() +
    "-" +
    checkZero(date.getMonth() + 1) +
    "-" +
    checkZero(date.getDate());
  return newDateFormat;
};

module.exports = { formatDateForInput };
