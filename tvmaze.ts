import axios from "axios"
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $getEpisodes = $(".getEpisodes");
console.log($getEpisodes);

const BASE_URL: string = "https://api.tvmaze.com";
const DEFAULT_IMAGE: string = "https://thumbs.dreamstime.com/b/no-image-available-icon-flat-vector-no-image-available-icon-flat-vector-illustration-132482953.jpg"

interface ShowInterface {
  id: string;
  name: string;
  summary: string;
  image: string;
}

interface EpisodeInterface {
  id: string;
  name: string;
  season: string;
  number: string;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<ShowInterface[]> {
  const response = await axios.get(`${BASE_URL}/search/shows?q=:${term}`);
  console.log(response.data);

  const shows = (response.data).map(show => {
    let { name, id, summary, image } = show.show;
    image = image ? image.medium : DEFAULT_IMAGE;
    return { name, id, summary, image }
  });
  console.log("shows", shows);

  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: ShowInterface[]) {
  console.log(shows);
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button id="${show.id}" class="btn btn-outline-light btn-sm Show-getEpisodes episode-button">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: string): Promise<EpisodeInterface[]> {
  console.log("in api function:", { id });
  console.log(`${BASE_URL}/shows/${id}/episodes`);
  const response = await axios.get(`${BASE_URL}/shows/${id}/episodes`);
  console.log(response.data);

  const episodes = (response.data).map(episode => {
    const { id, name, season, number } = episode
    return { id, name, season, number }
  });
  console.log("shows", episodes);

  return episodes;
}


/** Write a clear docstring for this function... */

// function populateEpisodes(episodes) { }
function populateEpisodes(episodes: EpisodeInterface[]) {
  console.log(episodes);
  $episodesArea.empty();

  for (let episode of episodes) {
    const $episode = $(
      `<li id="${episode.id}">${episode.name} (season ${episode.season}, number ${episode.number})
       </li>.`
    );
    $episodesArea.append(`${$episode}`);
  }
  $episodesArea.show();
}

async function handleEpisodesClick(evt) {

  const id = $(evt.target).closest("Show").attr("data-show-id");
  console.log("before api call:", id);
  const episodes = await getEpisodesOfShow(id);
  console.log("afer api call:", { episodes });
  populateEpisodes(episodes);
}

//
$showsList.on("click", ".episode-button", handleEpisodesClick);
//  {
//   console.log(evt.target);
//   const id = evt.target.id;
//   await handleClickAndDisplayEpisodes(id);
// });
