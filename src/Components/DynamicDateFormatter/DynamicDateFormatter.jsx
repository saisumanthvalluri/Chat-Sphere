import { format, isToday, isYesterday } from "date-fns";

const DynamicDateFormatter = (timeStamp, chat) => {
    const date = new Date(timeStamp);

    if (isToday(date)) {
        return format(date, "HH:mm");
    } else if (isYesterday(date)) {
        return chat ? `Yesterday ${format(date, "HH:mm")}` : "Yesterday";
    } else {
        return format(date, chat ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy");
    }
};

export default DynamicDateFormatter;
