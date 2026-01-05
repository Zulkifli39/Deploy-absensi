export const getLateLevel = (minutes) => {
  if (minutes >= 1 && minutes < 30) return "TL1";
  if (minutes >= 31 && minutes < 60) return "TL2";
  if (minutes >= 61) return "TL3";
  return null;
};

export const getEarlyLeaveLevel = (minutes) => {
  if (minutes >= 1 && minutes < 30) return "PSW1";
  if (minutes >= 31 && minutes < 60) return "PSW2";
  if (minutes >= 61 && minutes < 90) return "PSW3";
  if (minutes >= 91) return "PSW4";
  return null;
};
