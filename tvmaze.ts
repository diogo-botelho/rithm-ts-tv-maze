import axios from "axios"
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");

const BASE_URL: string = "https://api.tvmaze.com";
const DEFAULT_IMAGE: string = "https://thumbs.dreamstime.com/b/no-image-available-icon-flat-vector-no-image-available-icon-flat-vector-illustration-132482953.jpg"

interface ShowInterface {
  id: string;
  name: string;
  summary: string;
  image: { medium: string } | null;
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

  const shows = (response.data).map((result: { show: ShowInterface }) => {
    let { name, id, summary, image } = result.show;
    if (image === null) {
      image = { medium: DEFAULT_IMAGE };
    }
    return { name, id, summary, image }
  });
  return shows;
}


/** Given list of shows, create markup for each and append to DOM */

function populateShows(shows: ShowInterface[]): void {
  console.log(shows);
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="col-md-12 col-lg-6 mb-4 show">
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

async function searchForShowAndDisplay(): Promise<void> {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt: JQuery.SubmitEvent) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return a promise when resolved provides an array of episodes:
 *  [{ id, name, season, number },...]
 */

async function getEpisodesOfShow(id: string): Promise<EpisodeInterface[]> {
  const response = await axios.get(`${BASE_URL}/shows/${id}/episodes`);

  const episodes: EpisodeInterface[] = (response.data).map(
    (episode: EpisodeInterface) => {
      const { id, name, season, number } = episode
      return { id, name, season, number }
    });

  return episodes;
}


/** Takes in an array of episodes and appends to DOM */

function populateEpisodes(episodes: EpisodeInterface[]) {
  // console.log(episodes);
  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $(
      `<li id="${episode.id}">${episode.name} (season ${episode.season}, number ${episode.number})
       </li>.`
    );
    $episodesList.append($episode);
  }
  $episodesArea.show();
}

/** Handles episode button click.
 * 
 * Takes in click event, gets episodes for show and appends to DOM
*/

async function handleEpisodesClick(evt: JQuery.ClickEvent): Promise<void> {

  const id = $(evt.target).closest(".show").attr("data-show-id");
  if (id === undefined) {
    return;
  }
  const episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
}

$showsList.on("click", ".episode-button", handleEpisodesClick);

