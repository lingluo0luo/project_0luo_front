// requestWeather.js
import axios from 'axios';

// 设置跨域请求头
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

// 定义post请求方法
export const axiosPost = function (url, params) {
    return new Promise((resolve, reject) => {
        axios
            .post(url, params)
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err);
            });
    });
};

// 定义get请求方法
export const axiosGet = function (url, params) {
    return new Promise((resolve, reject) => {
        axios
            .get(url, {
                params,
            })
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err);
            });
    });
};

// 获取城市编码
export async function getCity() {
    const params = {
        key: 'ee2b24cb2b4a0241696348965e8873e5', // 你的key  1
        address: '山东省济南市历城区', // 你的地址信息 2
    };
    let res = await axiosGet('https://restapi.amap.com/v3/geocode/geo', params);
    return res.data.geocodes[0].adcode;
}

// 获取天气信息
export async function getWeather() {
    const adcode = await getCity();
    const params = {
        key: 'ee2b24cb2b4a0241696348965e8873e5', // 你的key  1
        city: adcode,
        extensions: 'base'
    };
    let res = await axiosGet('https://restapi.amap.com/v3/weather/weatherInfo', params);
    if (res.data.status === '1' && res.data.infocode === '10000') {
        return res.data.lives[0];
    } else {
        throw new Error(`获取天气信息失败: ${res.data.info}`);
    }
}