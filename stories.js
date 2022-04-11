"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function newStorySubmit(evt) {
  evt.preventDefault();

  const title = $("create-title").val();
  const url = $("#create-url").val();
  const author = $("#create-author").val();
  const username = currentUser.username
  const data = {title, url, author, username};

  const response = await storyList.addStory(currentUser, data);
  const story = generateStoryMarkup(response);
  $allStoriesList.prepend(story);
}

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}


async function favoriteStory(evt){
  const $target = $(evt.target);
  const $closestLi = $target.clostest("li");
  const storyId = $closestLi.attri("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);

  if ($target.hasClass("fas")){ 
    await currentUser.removeFavorite(storyId);
    $target.closest("i").toggleClass("fas far");
  } else{
    await currentUser.addFavorite(storyId);
    $target.closest("i").toggleClass("fas far");
  }
}
$storiesLists.on("click", ".star", favoriteStory);

function getDeleteBtnHTML() {
  return `
  <span class="trash-can">
    <i class="fas fa-trash-alt"></i>
  </span>`;
}

async function deleteStory(evt) {
  console.debug("deleteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  // re-generate story list
  await putStoriesOnPage();
}

$ownStories.on("click", ".trash-can", deleteStory);
