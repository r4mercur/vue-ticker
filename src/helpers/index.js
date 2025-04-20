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
    START_HALFTIME: Symbol("START_HALFTIME"),
    END_GAME: Symbol("END_GAME"),
    GOAL: Symbol("GOAL"),
    ASSIST: Symbol("ASSIST"),
    YELLOW_CARD: Symbol("YELLOW_CARD"),
    RED_CARD: Symbol("RED_CARD"),
})

export class Stopwatch {
    constructor() {
        this.time = 0;
        this.interval = null;
    }

    start() {
        if (this.interval) return;
        this.interval = setInterval(() => {
            this.time++;
        }, 1000)
    }

    setTime(time) {
        this.pause();
        this.time = time;
    }

    pause() {
        clearInterval(this.interval);
        this.interval = null;
    }

    reset() {
        this.pause();
        this.time = 0;
    }

    getTime() {
        return this.formatTime();
    }

    formatTime() {
        const minutes = Math.floor(this.time / 60).toString().padStart(2, "0");
        const seconds = (this.time % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    }
}