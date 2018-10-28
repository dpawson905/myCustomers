const axios = require('axios');

let img = axios.get('https://source.unsplash.com/200x200/?bugs,insects')
  .then((response) => {
    console.log(response.image)
  })