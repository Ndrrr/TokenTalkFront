import axios from 'axios';

export const baseBackUrl = 'https://tokentalk.live:8443/api';
export const baseFrontUrl = 'http://localhost:3000';
axios.defaults.baseURL = baseBackUrl;

