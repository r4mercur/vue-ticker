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

// event_type has no DB-level enum on the backend (see rails-api-ticker
// app/models/ticker_event.rb) — these numbers are a shared frontend/backend
// convention. Keep this in sync with ScoreCalculator::GOAL_EVENT_TYPES in
// the backend repo if GOAL/PENALTY_GOAL/OWN_GOAL ever change.
export const EventTypesEnum = {
    START_GAME: 1,
    START_HALFTIME: 2,
    END_GAME: 3,
    GOAL: 4,
    YELLOW_CARD: 5,
    RED_CARD: 6,
    TEXT: 7,
    PENALTY_GOAL: 8,
    OWN_GOAL: 9,
    MISSED_PENALTY: 10,
    YELLOW_RED_CARD: 11,
    VAR_DECISION: 12,
    SUBSTITUTION: 13,
    INJURY: 14,
    EXTRA_TIME: 15,
};

export const EventTypeLabels = {
    1: 'START_GAME',
    2: 'START_HALFTIME',
    3: 'END_GAME',
    4: 'GOAL',
    5: 'YELLOW_CARD',
    6: 'RED_CARD',
    7: 'TEXT',
    8: 'PENALTY_GOAL',
    9: 'OWN_GOAL',
    10: 'MISSED_PENALTY',
    11: 'YELLOW_RED_CARD',
    12: 'VAR_DECISION',
    13: 'SUBSTITUTION',
    14: 'INJURY',
    15: 'EXTRA_TIME',
};

// Mirrors the backend's ScoreCalculator::GOAL_EVENT_TYPES — used to render a
// running score next to goal events in the feed. MISSED_PENALTY intentionally
// does not count.
export const GOAL_EVENT_TYPES = [EventTypesEnum.GOAL, EventTypesEnum.PENALTY_GOAL, EventTypesEnum.OWN_GOAL];

// Display metadata for the event-type chooser and the ticker feed. Grouped
// the way the mockup groups them: Tore / Karten / Spieler & Spielverlauf.
export const EVENT_TYPE_GROUPS = [
    {
        label: "Tore",
        types: [
            { type: EventTypesEnum.GOAL, label: "Tor", icon: "md-sportssoccer" },
            { type: EventTypesEnum.PENALTY_GOAL, label: "Elfmeter", icon: "md-sportssoccer" },
            { type: EventTypesEnum.OWN_GOAL, label: "Eigentor", icon: "md-swaphoriz" },
            { type: EventTypesEnum.MISSED_PENALTY, label: "Verschossen", icon: "md-close" },
        ],
    },
    {
        label: "Karten",
        types: [
            { type: EventTypesEnum.YELLOW_CARD, label: "Gelb", card: "yellow" },
            { type: EventTypesEnum.YELLOW_RED_CARD, label: "Gelb-Rot", card: "yellow-red" },
            { type: EventTypesEnum.RED_CARD, label: "Rot", card: "red" },
            { type: EventTypesEnum.VAR_DECISION, label: "VAR", icon: "md-sync" },
        ],
    },
    {
        label: "Spieler & Spielverlauf",
        types: [
            { type: EventTypesEnum.SUBSTITUTION, label: "Wechsel", icon: "md-swaphoriz" },
            { type: EventTypesEnum.INJURY, label: "Verletzung", icon: "md-medicalservices" },
            { type: EventTypesEnum.EXTRA_TIME, label: "Nachspielzeit", icon: "md-accesstime" },
            { type: EventTypesEnum.TEXT, label: "Text", icon: "bi-chat-text-fill" },
        ],
    },
];

export const CARD_REASONS = ["Foulspiel", "Unsportlichkeit", "Meckern", "Handspiel", "Notbremse"];
export const GOAL_TYPES = ["Schuss", "Kopfball", "Freistoß"];
export const TEXT_PRESETS = ["Ecke", "Freistoß", "Abseits", "Große Chance", "Latte / Pfosten", "Trinkpause"];
export const VAR_DECISION_PRESETS = ["Tor bestätigt", "Tor aberkannt", "Elfmeter bestätigt", "Elfmeter zurückgenommen", "Rote Karte nach Überprüfung", "Abseits bestätigt"];
export const INJURY_NOTE_PRESETS = ["Weiterspielen", "Behandlung auf dem Feld", "Ausgewechselt"];

// TEXT events have no dedicated `highlight` boolean column (MVP convention,
// see backend notes) — encoded as a leading marker on `text` instead.
const HIGHLIGHT_MARKER = "★ ";

export function isHighlighted(text) {
    return !!text && text.startsWith(HIGHLIGHT_MARKER);
}

export function stripHighlightMarker(text) {
    return isHighlighted(text) ? text.slice(HIGHLIGHT_MARKER.length) : text;
}

export function withHighlightMarker(text, highlighted) {
    return (highlighted ? HIGHLIGHT_MARKER : "") + text;
}

// Shared feed-row description for a ticker_event, used by both the editor
// (TickerView.vue) and the public reader (PublicTickerView.vue) so the two
// don't drift apart. `ctx` supplies the lookups that need the surrounding
// ticker's team/player context: { homeTeamId, awayTeamId, playerName(id),
// teamShortname(teamId) }.
export function describeTickerEvent(event, ctx) {
    const { playerName, teamShortname } = ctx;

    switch (event.event_type) {
        case EventTypesEnum.START_GAME:
            return { system: true, title: "Anpfiff 1. Halbzeit" };
        case EventTypesEnum.START_HALFTIME:
            return { system: true, title: "Halbzeitpfiff" };
        case EventTypesEnum.END_GAME:
            return { system: true, title: "Abpfiff" };
        case EventTypesEnum.GOAL:
        case EventTypesEnum.PENALTY_GOAL:
        case EventTypesEnum.OWN_GOAL: {
            const kind = event.event_type === EventTypesEnum.OWN_GOAL ? "Eigentor" : event.event_type === EventTypesEnum.PENALTY_GOAL ? "Elfmeter" : "Tor";
            const assist = event.fk_player2_id ? `, Vorlage ${playerName(event.fk_player2_id)}` : "";
            return { title: `${kind} · ${playerName(event.player_id)}`, subtitle: `${teamShortname(event.team_id)}${event.text ? " · " + event.text : ""}${assist}`, score: event.scoreAtEvent, goal: true };
        }
        case EventTypesEnum.MISSED_PENALTY:
            return { title: `Elfmeter verschossen · ${playerName(event.player_id)}`, subtitle: teamShortname(event.team_id) };
        case EventTypesEnum.YELLOW_CARD:
        case EventTypesEnum.YELLOW_RED_CARD:
        case EventTypesEnum.RED_CARD: {
            const label = event.event_type === EventTypesEnum.YELLOW_CARD ? "Gelbe Karte" : event.event_type === EventTypesEnum.RED_CARD ? "Rote Karte" : "Gelb-Rote Karte";
            return { title: `${label} · ${playerName(event.player_id)}`, subtitle: `${teamShortname(event.team_id)}${event.text ? " · " + event.text : ""}`, card: event.event_type };
        }
        case EventTypesEnum.TEXT:
            return { title: stripHighlightMarker(event.text), highlighted: isHighlighted(event.text), text: true };
        case EventTypesEnum.SUBSTITUTION:
            return { title: `${playerName(event.fk_player2_id)} für ${playerName(event.fk_player1_id)}`, subtitle: `${teamShortname(event.team_id)}${event.text ? " · " + event.text : ""}`, substitution: true };
        case EventTypesEnum.INJURY:
            return { title: `Verletzung · ${playerName(event.player_id)}`, subtitle: `${teamShortname(event.team_id)}${event.text ? " · " + event.text : ""}`, injury: true };
        case EventTypesEnum.VAR_DECISION:
            return { title: "VAR-Entscheidung", subtitle: `${event.team_id ? teamShortname(event.team_id) + " · " : ""}${event.text ?? ""}`, varDecision: true };
        case EventTypesEnum.EXTRA_TIME:
            return { title: `Nachspielzeit ${event.text ?? ""}`, extraTime: true };
        default:
            return { title: EventTypeLabels[event.event_type] ?? "Ereignis" };
    }
}

// Annotates a chronologically-ordered (oldest first) events array with the
// running score at each goal-type event, then returns it newest-first for
// feed display — shared by TickerView.vue and PublicTickerView.vue.
export function withRunningScore(chronologicalEvents, homeTeamId, awayTeamId) {
    let home = 0;
    let away = 0;
    const withScore = chronologicalEvents.map((event) => {
        if (GOAL_EVENT_TYPES.includes(event.event_type)) {
            if (event.team_id === homeTeamId) home++;
            else if (event.team_id === awayTeamId) away++;
            return { ...event, scoreAtEvent: `${home}:${away}` };
        }
        return event;
    });
    return withScore.reverse();
}

export const TEAM_LOGO_PLACEHOLDER = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='24' fill='%239ca3af'/%3E%3Cpath d='M24 12a6 6 0 100 12 6 6 0 000-12zM12 38c0-6.6 5.4-12 12-12s12 5.4 12 12' fill='%23ffffff'/%3E%3C/svg%3E";

// Ticker states that mean "the game is currently being tickered", as returned
// by the Rails enum (serialized as its string label, e.g. "first_half").
const RUNNING_TICKER_STATES = ["first_half", "second_half", "third_half", "fourth_half", "half_time"];

// A game's schedule status is derived from its (at most one) ticker: no
// ticker yet or a ticker that hasn't kicked off both read as "planned".
export function gameStatus(game) {
    const state = game?.ticker?.ticker_state;
    if (!state || state === "not_started") return "planned";
    if (state === "ended") return "ended";
    return RUNNING_TICKER_STATES.includes(state) ? "live" : "planned";
}

export const GameStatusLabels = {
    planned: "Geplant",
    live: "Live",
    ended: "Beendet",
};

// The backend stores positions as English enum-ish strings (seed data uses
// "Goalkeeper"/"Defender"/"Midfielder"/"Striker"); the UI shows short German
// codes/labels for them, kept consistent for both new and seeded players.
export const PLAYER_POSITIONS = [
    { value: "Goalkeeper", code: "TW", label: "Torwart" },
    { value: "Defender", code: "ABW", label: "Abwehr" },
    { value: "Midfielder", code: "MF", label: "Mittelfeld" },
    { value: "Striker", code: "ST", label: "Sturm" },
];

export function positionLabel(value) {
    return PLAYER_POSITIONS.find((p) => p.value === value)?.label ?? (value || "—");
}

export function positionCode(value) {
    return PLAYER_POSITIONS.find((p) => p.value === value)?.code ?? (value ? value.slice(0, 3).toUpperCase() : "—");
}

export const PlayerStatusLabels = {
    active: "Aktiv",
    injured: "Verletzt",
    suspended: "Gesperrt",
};

// Players only store `age`, not a birth date, so "Jahrgang" (birth year) is
// an approximation derived from the current year.
export function ageToBirthYear(age) {
    return age || age === 0 ? new Date().getFullYear() - age : null;
}

export function birthYearToAge(birthYear) {
    return birthYear ? new Date().getFullYear() - birthYear : null;
}

export function teamLogoSrc(url) {
    return url && url.trim() !== "" ? url : TEAM_LOGO_PLACEHOLDER;
}

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