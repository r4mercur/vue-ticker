<script setup>
import { computed } from "vue";
import { formatDateToGermanTimeFormat, gameStatus, GameStatusLabels, teamLogoSrc, TEAM_LOGO_PLACEHOLDER } from "@/helpers/index.js";

const props = defineProps({
  games: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["create-ticker", "open-ticker"]);

const statusPillClass = {
  planned: "bg-surface-alt text-on-surface/70",
  live: "bg-orange-500/15 text-orange-600 dark:text-orange-300",
  ended: "bg-surface-alt text-on-surface/70",
};

const kickoffTime = (date_string) => {
  const date = new Date(date_string);
  return date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0");
};

const score = (game) => {
  const status = gameStatus(game);
  if (status === "planned") return null;
  return `${game.ticker?.goals_home ?? 0} : ${game.ticker?.goals_away ?? 0}`;
};

const groupedByDate = computed(() => {
  const groups = [];
  const byKey = new Map();

  for (const game of props.games) {
    const key = formatDateToGermanTimeFormat(game.date, false);
    if (!byKey.has(key)) {
      const group = { date: key, games: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    byKey.get(key).games.push(game);
  }

  return groups;
});

const actionLabel = (game) => {
  const status = gameStatus(game);
  if (status === "planned" && !game.ticker) return "Ticker anlegen";
  if (status === "ended") return "Nachlesen";
  return "Tickern";
};

const onAction = (game) => {
  if (!game.ticker) {
    emit("create-ticker", game);
  } else {
    emit("open-ticker", game.ticker.id);
  }
};
</script>

<template>
  <div v-if="games.length === 0" class="rounded-xl border border-border-subtle bg-surface p-8 text-center text-sm text-on-surface/60">
    Keine Spiele für diese Auswahl.
  </div>

  <div v-else class="flex flex-col gap-5">
    <div v-for="group in groupedByDate" :key="group.date" class="overflow-hidden rounded-xl border border-border-subtle bg-surface">
      <div class="flex items-center justify-between border-b border-border-subtle bg-surface-alt px-4 py-2.5">
        <span class="text-sm font-semibold">{{ group.date }}</span>
        <span class="text-xs text-on-surface/55">{{ group.games.length }} {{ group.games.length === 1 ? "Spiel" : "Spiele" }}</span>
      </div>

      <div
        v-for="game in group.games"
        :key="game.id"
        class="grid grid-cols-[56px_minmax(0,1fr)_70px_minmax(0,1fr)_90px_140px] items-center gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0 sm:gap-4"
      >
        <span class="font-mono text-base font-semibold tabular-nums">{{ kickoffTime(game.date) }}</span>

        <span class="flex items-center justify-end gap-2 truncate text-right text-sm font-medium">
          {{ game.team_home?.name }}
          <img :src="teamLogoSrc(game.team_home?.logo_url)" @error="(e) => e.target.src = TEAM_LOGO_PLACEHOLDER" class="h-6 w-6 shrink-0 object-contain" alt="" />
        </span>

        <span class="text-center font-mono text-lg font-bold tabular-nums" :class="score(game) ? '' : 'text-on-surface/40 text-sm font-normal'">
          {{ score(game) ?? "—" }}
        </span>

        <span class="flex items-center gap-2 truncate text-sm font-medium">
          <img :src="teamLogoSrc(game.team_away?.logo_url)" @error="(e) => e.target.src = TEAM_LOGO_PLACEHOLDER" class="h-6 w-6 shrink-0 object-contain" alt="" />
          {{ game.team_away?.name }}
        </span>

        <span class="flex items-center gap-1.5 justify-self-start rounded-full px-2.5 py-1 text-xs font-semibold" :class="statusPillClass[gameStatus(game)]">
          <span v-if="gameStatus(game) === 'live'" class="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500 animate-pulse"></span>
          {{ GameStatusLabels[gameStatus(game)] }}
        </span>

        <button
          type="button"
          @click="onAction(game)"
          class="cursor-pointer justify-self-end rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
          :class="gameStatus(game) === 'live' || !game.ticker
            ? 'bg-secondary text-white hover:bg-indigo-600'
            : 'border border-border-subtle hover:border-secondary hover:text-secondary'"
        >
          {{ actionLabel(game) }}
        </button>
      </div>
    </div>
  </div>
</template>
