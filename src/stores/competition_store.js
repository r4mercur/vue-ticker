import { defineStore } from "pinia";
import axios from "axios";

export const useCompetitionStore = defineStore('competition', {
    state: () => ({
        competitions: [],
        teams: [],
        players: [],
        selected_competition: null,
    }),
    persist: true,
    actions: {
        setCompetitions(competitions) {
            this.competitions = competitions;
        },
        setCompetition(competition) {
            this.selected_competition = competition;
        },
        setTeams(teams) {
            this.teams = teams;
        },
        setPlayers(players) {
            this.players = players;
        },
        async fetchCompetitions() {
            axios.get('http://localhost:3000/competitions').then(response => {
                this.setCompetitions(response.data);
            }).catch(error => {
                console.log(error);
            })
        }
    }
});