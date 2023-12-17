import { defineStore } from "pinia";
import axios from "axios";
import { api_information } from "@/stores/index.js";

const url = api_information.url;

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
            axios.get(url + '/competitions').then(response => {
                this.setCompetitions(response.data);
            }).catch(error => {
                console.log(error);
            })
        },
        async fetchTeamsByCompetitionId(competitionId) {
            axios.get(url + '/api/competitions/' + competitionId + '/teams').then(response => {
                this.setTeams(response.data);
            }).catch(error => {
                console.log(error);
            });
        },
        async deleteCompetition(competitionId) {
            axios.delete(url + '/competitions/' + competitionId).then(response => {
                if(response.status === 200) {
                    this.fetchCompetitions();
                }
            }).catch(error => {
                console.log(error);
            });
        },
        async createCompetition(competition) {
            axios.post(url + '/competitions', competition).then(response => {
                if(response.status === 201) {
                    this.fetchCompetitions();
                }
            }).catch(error => {
                console.log(error);
            });
        },
        async updateCompetition(competition) {
            axios.put(url + '/competitions/' + competition.id, competition).then(response => {
                if(response.status === 200) {
                    this.fetchCompetitions();
                }
            }).catch(error => {
                console.log(error);
            });
        },
    }
});

export default useCompetitionStore;