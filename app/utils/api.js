import axios from 'axios';

const id = "27a56c2c997a9a70655b";
const secret = "fff46747c084559db32ac9b16416117b3f9b3833";
const params = `?client_id=${id}&client_secret=${secret}`;

const getProfile = username => 
  axios.get(`https://api.github.com/users/${username}${params}`)
    .then(response => response.data);

const getRepos = username => 
  axios.get(`https://api.github.com/users/${username}/repos${params}&per_page=100`)
    .then(response => response.data);

const getStarCount = repos =>
  repos.reduce((count, repo) => count + repo.stargazers_count, 0);

const calculateScore = (profile, repos) => {
  const followers = profile.followers;
  const totalStars = getStarCount(repos);

  return (followers * 3) + totalStars;
};

const handleError = error => {
  console.warn(error);
  return null;
};

const getUserData = player =>
  axios.all([
    getProfile(player),
    getRepos(player)
  ])
    .then(data => {
      const profile = data[0];
      const repos = data[1];
      return {
        profile,
        score: calculateScore(profile, repos)
      };
    });

const sortPlayers = players => players.sort((a, b) => b.score - a.score);

module.exports = {
  battle: players =>
    axios.all(players.map(getUserData))
      .then(sortPlayers)
      .catch(handleError),
  fetchPopularRepos: language => {
    const encodedURI = window.encodeURI(`https://api.github.com/search/repositories?q=stars:>1+language:${language}&sort=stars&order=desc&type=Repositories`);

    return axios.get(encodedURI)
      .then(response => response.data.items);
  }
};
