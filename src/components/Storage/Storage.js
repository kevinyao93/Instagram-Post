// Area for managing all the local storage
import { createLocalStorageStateHook } from 'use-local-storage-state'

const defaultUser = {name: 'Nvidia', comment:'Currently in delay central', image:'nvidia-logo.jpeg' }

export const userStorage = createLocalStorageStateHook('users', [
  defaultUser,
  {name: 'Nintendo', comment:'Currently Playing Zelda', image:'nintendo-logo.jpg'},
  {name: 'Apple', comment:'Eating Apples', image:'apple-logo.jpg'},
  {name: 'Microsoft', comment:'Contemplating Windows', image:'microsoft-logo.png'},
]);

export const commentStorage = createLocalStorageStateHook('comments', []);

export const statusStorage = createLocalStorageStateHook('status', {
  liked: [], bookmarked: [], currentUser: defaultUser
});
