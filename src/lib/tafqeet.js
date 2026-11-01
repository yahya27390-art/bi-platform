/**
 * Centralized Arabic Number-to-Words Converter (Tafqeet Engine)
 * Designed for Saudi Riyals (SAR) and Halalas
 * 100% Pure JavaScript, No external dependencies
 */

const ones = [
  '', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة',
  'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر',
  'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'
];

const tens = [
  '', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'
];

const hundreds = [
  '', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'
];

function convertThreeDigits(num) {
  let result = '';
  const h = Math.floor(num / 100);
  const remainder = num % 100;

  if (h > 0) {
    result += hundreds[h];
  }

  if (remainder > 0) {
    if (result !== '') result += ' و';
    if (remainder < 20) {
      result += ones[remainder];
    } else {
      const o = remainder % 10;
      const t = Math.floor(remainder / 10);
      if (o > 0) {
        result += ones[o] + ' و' + tens[t];
      } else {
        result += tens[t];
      }
    }
  }

  return result;
}

export function tafqeetSAR(amount) {
  if (amount == null || isNaN(amount) || amount === 0) {
    return 'صفر ريال سعودي لا غير';
  }

  const num = Math.abs(Number(amount));
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let parts = [];

  // Millions
  const millions = Math.floor(integerPart / 1000000);
  const thousands = Math.floor((integerPart % 1000000) / 1000);
  const remainder = integerPart % 1000;

  if (millions > 0) {
    if (millions === 1) {
      parts.push('مليون');
    } else if (millions === 2) {
      parts.push('مليونان');
    } else if (millions >= 3 && millions <= 10) {
      parts.push(convertThreeDigits(millions) + ' ملايين');
    } else {
      parts.push(convertThreeDigits(millions) + ' مليون');
    }
  }

  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('ألف');
    } else if (thousands === 2) {
      parts.push('ألفان');
    } else if (thousands >= 3 && thousands <= 10) {
      parts.push(convertThreeDigits(thousands) + ' آلاف');
    } else {
      parts.push(convertThreeDigits(thousands) + ' ألف');
    }
  }

  if (remainder > 0) {
    parts.push(convertThreeDigits(remainder));
  }

  let text = parts.join(' و');

  if (integerPart > 0) {
    if (integerPart === 1) {
      text += ' ريال سعودي';
    } else if (integerPart === 2) {
      text += ' ريالان سعوديان';
    } else if (integerPart >= 3 && integerPart <= 10) {
      text += ' ريالات سعودية';
    } else {
      text += ' ريالاً سعودياً';
    }
  }

  if (decimalPart > 0) {
    const halalaText = convertThreeDigits(decimalPart);
    if (integerPart > 0) {
      text += ' و' + halalaText + (decimalPart === 1 ? ' هللة' : decimalPart === 2 ? ' هللتان' : ' هللة');
    } else {
      text = halalaText + ' هللة';
    }
  }

  return 'فقط وقدره ' + text + ' لا غير';
}
