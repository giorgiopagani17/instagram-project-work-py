import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

//-------UPLOAD POST-------//
export async function uploadPost(userId, blob, description) {
    const upload_path = 'http://localhost:8000/upload/' + userId;
    const formData = new FormData();
    const fileName = generateFileName();
    formData.append('file', blob, fileName); // Aggiungi l'immagine al FormData
    formData.append('description', description);
    
    const response = await fetch(upload_path, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to upload image');
    }

    const data = await response.json();
    console.log('Image uploaded successfully:', data);
}

function generateFileName() {
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 10000);
    return `${timestamp}_${randomNum}.jpg`;
}

//-------UPLOAD PROFILE IMAGE-------//
export async function uploadImageProfile(userId, blob) {
  const upload_path = 'http://localhost:8000/imgprofile/' + userId;
  const formData = new FormData();
  const fileName = generateFileName();
  formData.append('file', blob, fileName); // Aggiungi l'immagine al FormData
  
  const response = await fetch(upload_path, {
      method: 'POST',
      body: formData
  });

  if (!response.ok) {
      throw new Error('Failed to upload image');
  }

  const data = await response.json();
  console.log('Image uploaded successfully:', data);
}

//-------USER POST-------//
export function useUserPost(id) {
  const [images, setImages] = useState([]);;

  useEffect(() => {
    async function fetchUserPost() {
      try {
        const response = await fetch(`http://localhost:8000/user_post/${id}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const imageData = await response.json();
        setImages(imageData);
      } catch (error) {
        console.error("Error fetching user images:", error);
      }
    }

    fetchUserPost();
  }, [id]);

  return images;
}

//-------EXPLORE POSTS-------//
export function useExplorePost(id) {
  const [imagesExplore, setImagesExplore] = useState([]);;

  useEffect(() => {
    async function fetchUserPost() {
      try {
        const response = await fetch(`http://localhost:8000/exploreposts/${id}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const imageData = await response.json();
        setImagesExplore(imageData);
      } catch (error) {
        console.error("Error fetching user images:", error);
      }
    }

    fetchUserPost();
  }, [id]);

  return imagesExplore;
}

//-------SEARCH USER-------//
const fetchUsers = async (query) => {
  try {
    const response = await fetch(`http://localhost:8000/api/users?search=${query}`);
    if (!response.ok) {
      throw new Error('Errore nella richiesta');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Errore durante il recupero degli utenti:', error);
    return []; // Ritorna un array vuoto in caso di errore
  }
};

export default fetchUsers;



