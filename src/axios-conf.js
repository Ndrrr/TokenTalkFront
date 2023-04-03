import axios from 'axios';

export const baseBackUrl = 'http://192.168.100.209:8080/api';
export const baseFrontUrl = 'http://192.168.100.209:3000';
axios.defaults.baseURL = baseBackUrl;

