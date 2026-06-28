document.getElementById("convert_button").onclick = function () {
  let date = document.getElementById("date_input").valueAsDate;
  document.getElementById("output").innerHTML = convert_to_bratwurst(date);
};

const today = new Date();

document.getElementById("today_output").innerHTML = convert_to_bratwurst(today);

function convert_to_bratwurst(date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  let res = to_base_12(year + 10368);
  res += "-";
  let ifc_date = to_ifc(year, month, day);
  console.log(ifc_date);
  if (ifc_date === "YD" || ifc_date === "LD") {
    res += ifc_date;
  } else {
    let base_12_month = to_base_12(ifc_date[0])
      .replaceAll('<span class="dek-char">h</span>', "h")
      .replaceAll('<span class="el-char">F</span>', "F");
    if (base_12_month.length === 1) {
      base_12_month = "0" + base_12_month;
    }
    res += base_12_month
      .replaceAll("h", '<span class="dek-char">h</span>')
      .replaceAll("F", '<span class="el-char">F</span>');
    res += "-";
    let base_12_day = to_base_12(ifc_date[1])
      .replaceAll('<span class="dek-char">h</span>', "h")
      .replaceAll('<span class="el-char">F</span>', "F");
    if (base_12_day.length === 1) {
      base_12_day = "0" + base_12_day;
    }
    res += base_12_day
      .replaceAll("h", '<span class="dek-char">h</span>')
      .replaceAll("F", '<span class="el-char">F</span>');
  }
  return res;
}

function to_ifc(year, month, day) {
  let isLeap = new Date(year, 1, 29).getMonth() === 1;
  let daysBeforeMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let doy = daysBeforeMonth[month - 1] + day;
  if (isLeap && month > 2) {
    doy += 1;
  }
  if (isLeap && doy === 168) {
    return "LD";
  }
  if (doy === 364 || (isLeap && doy === 365)) {
    return "YD";
  }
  if (isLeap && doy > 168) {
    doy -= 1; // treat days after LD on a leap year as if it weren't a leap year
  }

  let ifc_month = Math.trunc(doy / 28) + 1;
  let ifc_day = doy % 28;

  return [ifc_month, ifc_day];
}

function to_base_12(num) {
  res = [];
  while (num > 12) {
    let digit = num % 12;
    num = Math.trunc(num / 12);
    res.push(format_digit(digit));
  }
  res.push(format_digit(num));
  return res.reverse().reduce((acc, curr) => {
    return acc + curr;
  }, "");
}

function format_digit(digit) {
  if (digit == 10) {
    return '<span class="dek-char">h</span>';
  } else if (digit == 11) {
    return '<span class="el-char">F</span>';
  } else {
    return digit.toString();
  }
}
