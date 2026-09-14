// wishes.js — kho lời chúc 20/10, tách riêng để sửa nội dung
// mà không phải đụng vào script.js hay index.html.

const WISH_TABS = [
  {
    id: "chung",
    label: "Chung",
    icon: "🌼",
    color: "#ffb648",
    colorSoft: "#ff9ec7",
    sealEmoji: "🎁",
    petalEmojis: ["🌼", "🌸", "✨"],
  },
  {
    id: "me",
    label: "Mẹ",
    icon: "🌷",
    color: "#d1495b",
    colorSoft: "#f4a6b7",
    sealEmoji: "🌷",
    petalEmojis: ["🌷", "🌹", "💮"],
  },
  {
    id: "nguoiyeu",
    label: "Người yêu",
    icon: "💗",
    color: "#ff4d79",
    colorSoft: "#ff8fab",
    sealEmoji: "💌",
    petalEmojis: ["💗", "💌", "🌹"],
  },
  {
    id: "banbe",
    label: "Bạn bè",
    icon: "✨",
    color: "#7c6cff",
    colorSoft: "#5eead4",
    sealEmoji: "🎉",
    petalEmojis: ["✨", "🎉", "💫"],
  },
];

const WISHES = {
  chung: [
    "Chúc mọi cô gái, mọi người phụ nữ quanh ta 20/10 thật rạng rỡ,\ntự tin và luôn được yêu thương thật nhiều 🌸",
    "20/10 vui vẻ! Mong bạn luôn giữ được nụ cười,\ndù ngày có mệt đến đâu ✨",
    "Chúc bạn một ngày 20/10 nhẹ nhàng,\nít deadline, nhiều bình yên 🌷",
    "Cảm ơn vì đã luôn cố gắng và toả sáng theo cách của riêng mình.\nChúc mừng 20/10 🌼",
    "Chúc bạn luôn khoẻ mạnh, xinh đẹp,\nvà làm những điều mình thật sự thích 💫",
    "20/10 này, mong bạn dành thời gian cho chính mình nhiều hơn nhé 🌹",
    "Chúc bạn một trái tim luôn ấm áp\nvà một cuộc sống luôn đủ đầy 🌻",
    "Phụ nữ giỏi giang, phụ nữ dịu dàng —\nbạn là cả hai. Chúc mừng 20/10 💖",
  ],
  me: [
    "Chúc mẹ luôn mạnh khoẻ,\nmọi lo toan cứ để con san sẻ bớt nhé 🌸",
    "Con biết ơn mẹ vì tất cả những điều thầm lặng mẹ đã làm.\n20/10 vui vẻ mẹ nhé 🌷",
    "Mong mẹ có thật nhiều thời gian nghỉ ngơi,\nít lo âu hơn, cười nhiều hơn 🌼",
    "Mẹ là chỗ dựa lớn nhất của con.\nChúc mừng 20/10, con yêu mẹ nhiều 💗",
    "Chúc mẹ luôn trẻ trung, yêu đời,\nvà tự hào về chính mình 🌹",
    "Cảm ơn mẹ vì đã luôn ở đó,\ndù con có thế nào đi nữa. Yêu mẹ! 🌻",
  ],
  nguoiyeu: [
    "Chúc bạn nhỏ của tớ 20/10 thật nhiều niềm vui,\ntớ luôn ở đây 💗",
    "Cảm ơn cậu vì đã xuất hiện và làm cuộc sống của tớ dễ chịu hơn.\n20/10 vui zẻ nha <3",
    "Mong đôi ta sẽ luôn ở bên nhau thật bền vững và lâu dài nhé 🌹",
    "Cậu không cần hoàn hảo, chỉ cần là cậu thôi.\nTớ đã thích như vậy rồi 💕",
    "Chúc mừng 20/10, người mà tớ luôn muốn kể mọi chuyện trong ngày cùng 🌸",
    "Yêu cậu nhiều lắm, hôm nay và cả những ngày sau nữa 💗",
  ],
  banbe: [
    "Chúc chị em mình luôn xinh đẹp,\ndeadline né mình, lương về đều 😆",
    "Girls support girls 💪 Chúc mừng 20/10 nha đồng nghiệp/bạn thân của tui!",
    "Cảm ơn vì đã luôn lắng nghe và cà khịa tui đúng lúc.\n20/10 vui vẻ 🌼",
    "Chúc mấy chị em mình mãi giữ được năng lượng vui vẻ như bây giờ ✨",
    "Một ngày để tụi mình tự thưởng cho bản thân — 20/10 vui nha! 🌷",
    "Có tụi bây bên cạnh là điều may mắn nhất rồi.\nChúc mừng 20/10 💖",
  ],
};

// Nội dung chữ bay trong nền 3D, đổi theo tab đang chọn.
const TEXTS_BY_TAB = {
  chung: ["20/10 vui vẻ", "Toả sáng theo cách của bạn", "Yêu thương gửi tới bạn", "Girls day 🌸"],
  me: ["Con yêu mẹ", "Mẹ là nhất", "20/10 vui vẻ mẹ ơi", "Cảm ơn mẹ"],
  nguoiyeu: ["I Love U💗", "20/10 zui zẻ<3", "Thương cậu nhất", "Mãi iuu"],
  banbe: ["Girls support girls", "Chúc mừng 20/10", "Yêu tụi bây", "Xinh đẹp mỗi ngày"],
};

window.WISH_TABS = WISH_TABS;
window.WISHES = WISHES;
window.TEXTS_BY_TAB = TEXTS_BY_TAB;
