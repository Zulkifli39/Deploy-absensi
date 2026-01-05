// utils/timeHelper.js
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const nowWITA = () => dayjs().tz("Asia/Makassar");
export const todayWITA = () => nowWITA().startOf("day").toDate();
    