
const apiKey = "2696bf65df97fc88821075ed391a3495";

export const trackIP = (ip) => {
    let url = `http://api.ipstack.com/${ip}?access_key=${apiKey}&fields=continent_code,country_code`;
    return fetch(url)
        .then(res => {
            return res.json();
        })
        .catch(err => console.log(err));
};
