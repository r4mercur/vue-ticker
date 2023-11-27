import { defineStore } from "pinia";
import axios from "axios";

export const useCompetitionStore = defineStore('competition', {
    state: () => ({
        competitions: [],
        teams: [],
        players: [],
    }),
    persist: true,
    actions: {
        setCompetitions(competitions) {
            this.competitions = competitions;
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
        },
        async fetchTeams(competitionId) {
            axios.get('http://localhost:3000/api/competitions/' + competitionId + '/teams').then(response => {
                this.setTeams(response.data);
            }).catch(error => {
                console.log(error);
            });
        }
    }
});