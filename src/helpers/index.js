export function formatDateToGermanTimeFormat (date_string, with_time) {
    const date = new Date(date_string);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");

    if (with_time) {
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    } else {
        return `${day}.${month}.${year}`;
    }
}

export const EventTypes = Object.freeze({
    START_GAME: Symbol("START_GAME"),
})