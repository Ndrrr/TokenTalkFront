import axios from 'axios';

export const baseBackUrl = 'https://34.69.59.106:8443/api';
export const baseFrontUrl = 'http://localhost:3000';
axios.defaults.baseURL = baseBackUrl;

