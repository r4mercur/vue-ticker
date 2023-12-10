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
        async fetchTeamsByCompetitionId(competitionId) {
            axios.get('http://localhost:3000/api/competitions/' + competitionId + '/teams').then(response => {
                this.setTeams(response.data);
            }).catch(error => {
                console.log(error);
            });
        },
        async deleteCompetition(competitionId) {
            axios.delete('http://localhost:3000/competitions/' + competitionId).then(response => {
                if(response.status === 200) {
                    this.fetchCompetitions();
                }
            }).catch(error => {
                console.log(error);
            });
        },
        async createCompetition(competition) {
            axios.post('http://localhost:3000/competitions', competition).then(response => {
                if(response.status === 201) {
                    this.fetchCompetitions();
                }
            }).catch(error => {
                console.log(error);
            });
        },
        async updateCompetition(competition) {
            axios.put('http://localhost:3000/competitions/' + competition.id, competition).then(response => {
                if(response.status === 200) {
                    this.fetchCompetitions();
                }
            }).catch(error => {
                console.log(error);
            });
        },
    }
});