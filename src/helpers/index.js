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

export const EventTypesEnum = {
    START_GAME: 1,
    START_HALFTIME: 2,
    END_GAME: 3,
    GOAL: 4,
    YELLOW_CARD: 5,
    RED_CARD: 6,
    TEXT: 7
};

export const EventTypeLabels = {
    1: 'START_GAME',
    2: 'START_HALFTIME',
    3: 'END_GAME',
    4: 'GOAL',
    5: 'YELLOW_CARD',
    6: 'RED_CARD',
    7: 'TEXT'
};

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